// DO NOT: import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import type { db as DBType } from "@/db";
import { db } from "@/db";
import type { FollowStatusEnumType } from "@/db/schema";
import {
	notificationsTable,
	profilesTable,
	viewHistoryTable,
} from "@/db/schema";
import { getViewHistory, isPostSeen } from "@/lib/server/redis-utils";

export type ViewerFollowStatus =
	| "none"
	| "pending"
	| "accepted"
	| "follows_you"
	| "follows_you_pending"
	| "mutual";

export const viewerFollowStatusEnum = [
	"none",
	"pending",
	"accepted",
	"follows_you",
	"follows_you_pending",
	"mutual",
] as const;

export function computeViewerStatus(
	iFollow: FollowStatusEnumType | undefined,
	theyFollow: FollowStatusEnumType | undefined
): ViewerFollowStatus {
	if (iFollow === "accepted" && theyFollow === "accepted") return "mutual";
	if (iFollow === "accepted") return "accepted";
	if (iFollow === "pending") return "pending";
	if (theyFollow === "accepted") return "follows_you";
	if (theyFollow === "pending") return "follows_you_pending";
	return "none";
}

export const customNanoid = customAlphabet(
	"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
	21
);

type StackableNotification =
	| { type: "like"; recipientId: string; actorId: string; postId: string }
	| {
			type: "comment";
			recipientId: string;
			actorId: string;
			postId: string;
			body: string;
			commentId: string;
	  }
	| {
			type: "comment_like";
			recipientId: string;
			actorId: string;
			commentId: string;
	  }
	| { type: "follow"; recipientId: string; actorId: string }
	| { type: "follow_accept"; recipientId: string; actorId: string }
	| {
			type: "reply";
			recipientId: string;
			actorId: string;
			postId: string;
			commentId: string;
			parentCommentId: string;
			body: string;
	  };

type SystemNotification = {
	type: "system";
	recipientId: string;
	body: string;
};

type NotificationInput = StackableNotification | SystemNotification;

export async function upsertNotification(input: NotificationInput) {
	if (input.type !== "system" && input.recipientId === input.actorId) return;

	if (input.type === "system") {
		await db.insert(notificationsTable).values({
			recipientId: input.recipientId,
			type: "system",
			body: input.body,
			actorIds: [],
			actorCount: 0,
			groupKey: null,
		});
		return;
	}

	const groupKey = (() => {
		switch (input.type) {
			case "like":
				return `like:${input.postId}`;
			case "comment":
				return `comment:${input.postId}`;
			case "comment_like":
				return `comment_like:${input.commentId}`;
			case "follow":
				return `follow:${input.actorId}`;
			case "follow_accept":
				return `follow_accept:${input.actorId}`;
			case "reply":
				return `reply:${input.parentCommentId}`;
		}
	})();

	const postId = "postId" in input ? input.postId : null;
	const commentId = "commentId" in input ? input.commentId : null;

	const body =
		input.type === "comment" || input.type === "reply" ? input.body : null;

	await db
		.insert(notificationsTable)
		.values({
			recipientId: input.recipientId,
			type: input.type,
			postId,
			commentId,
			groupKey,
			actorIds: [input.actorId],
			actorCount: 1,
			body,
			read: false,
		})
		.onConflictDoUpdate({
			target: [notificationsTable.recipientId, notificationsTable.groupKey],
			set: {
				actorIds: sql`
					ARRAY(
						SELECT DISTINCT unnest(
							ARRAY[${input.actorId}]::text[] || ${notificationsTable.actorIds}
						)
						LIMIT 5
					)
				`,
				actorCount: sql`
					CASE
						WHEN ${input.actorId} = ANY(${notificationsTable.actorIds})
						THEN ${notificationsTable.actorCount}
						ELSE ${notificationsTable.actorCount} + 1
					END
				`,
				body:
					input.type === "comment" || input.type === "reply"
						? sql`
							CASE
								WHEN ${notificationsTable.actorCount} < 50
								THEN ${input.body}
								ELSE NULL
							END
						`
						: notificationsTable.body,
				read: false,
				updatedAt: new Date(),
			},
		});
}

export async function getAdminUserIds(db: typeof DBType): Promise<string[]> {
	const admins = await db
		.select({ userId: profilesTable.userId })
		.from(profilesTable)
		.where(eq(profilesTable.role, "admin"));
	return admins.map((a) => a.userId);
}

export async function isPostSeenByUser(
	db: typeof DBType,
	userId: string,
	postId: string
): Promise<boolean> {
	const [seenRedis, seenDB] = await Promise.all([
		isPostSeen(userId, postId),
		db
			.select({ postId: viewHistoryTable.postId })
			.from(viewHistoryTable)
			.where(
				and(
					eq(viewHistoryTable.userId, userId),
					eq(viewHistoryTable.postId, postId)
				)
			)
			.limit(1)
			.then((r) => r.length > 0),
	]);

	return seenRedis || seenDB;
}

export async function getSeenPostIdsSet(
	db: typeof DBType,
	userId: string
): Promise<Set<string>> {
	const [seenRedis, seenDB] = await Promise.all([
		getViewHistory(userId),
		db
			.select({ postId: viewHistoryTable.postId })
			.from(viewHistoryTable)
			.where(eq(viewHistoryTable.userId, userId))
			.then((rows) => rows.map((r) => r.postId)),
	]);

	return new Set<string>([...(seenRedis as string[]), ...seenDB]);
}
