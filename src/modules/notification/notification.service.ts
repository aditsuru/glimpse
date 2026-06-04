/** biome-ignore-all lint/style/noNonNullAssertion: same pattern as other services */
import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { commentsTable } from "@/db/schema/comments";
import { notificationsTable } from "@/db/schema/notifications";
import { postsTable } from "@/db/schema/posts";
import { profilesTable } from "@/db/schema/profiles";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { notificationSchema } from "./notification.schema";

export class NotificationService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async getAll({
		cursor,
	}: z.infer<typeof notificationSchema.getAll.input>): Promise<
		z.infer<typeof notificationSchema.getAll.output>
	> {
		const limit = config.POSTS_PAGINATION_LIMIT;

		const rows = await this.db
			.select()
			.from(notificationsTable)
			.where(
				and(
					eq(notificationsTable.recipientId, this.userId),
					cursor ? lt(notificationsTable.updatedAt, cursor) : undefined
				)
			)
			.orderBy(desc(notificationsTable.updatedAt))
			.limit(limit + 1);

		const hasNext = rows.length > limit;
		const trimmed = hasNext ? rows.slice(0, -1) : rows;
		const nextCursor = hasNext ? trimmed.at(-1)!.updatedAt : null;

		if (trimmed.length === 0) return { items: [], nextCursor: null };

		const allActorIds = [
			...new Set(trimmed.flatMap((n) => n.actorIds as string[])),
		];

		const postIds = [
			...new Set(
				trimmed.filter((n) => n.postId !== null).map((n) => n.postId!)
			),
		];
		const commentIds = [
			...new Set(
				trimmed.filter((n) => n.commentId !== null).map((n) => n.commentId!)
			),
		];

		const [profiles, posts, comments] = await Promise.all([
			allActorIds.length > 0
				? this.db
						.select({
							userId: profilesTable.userId,
							username: profilesTable.username,
							displayName: profilesTable.displayName,
							isGlimpseVerified: profilesTable.isGlimpseVerified,
							avatarKey: profilesTable.avatarKey,
							updatedAt: profilesTable.updatedAt,
						})
						.from(profilesTable)
						.where(inArray(profilesTable.userId, allActorIds))
				: Promise.resolve([]),

			postIds.length > 0
				? this.db
						.select({
							id: postsTable.id,
							body: postsTable.body,
							attachment: sql<{
								mimeType: string;
								attachmentKey: string;
								updatedAt: Date;
							} | null>`(
								SELECT json_build_object(
									'mimeType', a.mime_type,
									'attachmentKey', a.attachment_key,
									'updatedAt', posts.updated_at
								)
								FROM attachments a
								WHERE a.post_id = posts.id
								ORDER BY a.position ASC
								LIMIT 1
							)`,
						})
						.from(postsTable)
						.where(inArray(postsTable.id, postIds))
				: Promise.resolve([]),

			commentIds.length > 0
				? this.db
						.select({
							id: commentsTable.id,
							postId: commentsTable.postId,
							parentCommentId: commentsTable.parentCommentId,
						})
						.from(commentsTable)
						.where(inArray(commentsTable.id, commentIds))
				: Promise.resolve([]),
		]);

		const profileMap = new Map(
			profiles.map((p) => [
				p.userId,
				{
					userId: p.userId,
					username: p.username,
					displayName: p.displayName,
					isGlimpseVerified: p.isGlimpseVerified,
					avatarUrl: p.avatarKey
						? constructPublicUrl({
								key: p.avatarKey,
								updatedAt: p.updatedAt,
							}).publicUrl
						: null,
				},
			])
		);

		const postMap = new Map(
			posts.map((p) => [
				p.id,
				{
					id: p.id,
					body: p.body,
					attachment: p.attachment
						? {
								mimeType: p.attachment.mimeType,
								url: constructPublicUrl({
									key: p.attachment.attachmentKey,
									updatedAt: new Date(p.attachment.updatedAt),
								}).publicUrl,
							}
						: null,
				},
			])
		);

		const commentMap = new Map(
			comments.map((c) => [
				c.id,
				{
					postId: c.postId,
					parentCommentId: c.parentCommentId,
				},
			])
		);

		type NotificationItem = z.infer<
			typeof notificationSchema.getAll.output
		>["items"][number];

		const items: NotificationItem[] = [];

		for (const n of trimmed) {
			const actorIds = n.actorIds as string[];
			const actors = actorIds
				.map((id) => profileMap.get(id))
				.filter((a): a is NonNullable<typeof a> => a !== undefined);

			const base = {
				id: n.id,
				read: n.read,
				actorCount: n.actorCount,
				actors,
				createdAt: n.createdAt,
				updatedAt: n.updatedAt,
			};

			switch (n.type) {
				case "like": {
					const post = postMap.get(n.postId!);
					if (!post) continue;
					items.push({ ...base, type: "like", postId: n.postId!, post });
					break;
				}
				case "comment": {
					const post = postMap.get(n.postId!);
					if (!post) continue;
					items.push({
						...base,
						type: "comment",
						postId: n.postId!,
						commentId: n.commentId!,
						post,
						body: n.body,
					});
					break;
				}
				case "comment_like": {
					const comment = commentMap.get(n.commentId!);
					if (!comment) continue;
					items.push({
						...base,
						type: "comment_like",
						postId: comment.postId,
						commentId: n.commentId!,
						parentCommentId: comment.parentCommentId,
					});
					break;
				}
				case "follow": {
					items.push({ ...base, type: "follow" });
					break;
				}
				case "follow_accept": {
					items.push({ ...base, type: "follow_accept" });
					break;
				}
				case "system": {
					if (!n.body) continue;
					items.push({ ...base, type: "system", body: n.body });
					break;
				}
				case "reply": {
					const post = postMap.get(n.postId!);
					if (!post) continue;
					items.push({
						...base,
						type: "reply",
						postId: n.postId!,
						commentId: n.commentId,
						parentCommentId: n.groupKey?.replace("reply:", "") ?? null,
						post,
						body: n.body,
					});
					break;
				}
			}
		}

		return { items, nextCursor };
	}

	async markSeen({
		notificationId,
	}: z.infer<typeof notificationSchema.markSeen.input>): Promise<
		z.infer<typeof notificationSchema.markSeen.output>
	> {
		await this.db
			.update(notificationsTable)
			.set({ read: true })
			.where(
				and(
					eq(notificationsTable.id, notificationId),
					eq(notificationsTable.recipientId, this.userId)
				)
			);

		return { success: true };
	}

	async getUnreadCount(): Promise<
		z.infer<typeof notificationSchema.getUnreadCount.output>
	> {
		const [result] = await this.db
			.select({
				count: sql<number>`cast(count(*) as integer)`,
			})
			.from(notificationsTable)
			.where(
				and(
					eq(notificationsTable.recipientId, this.userId),
					eq(notificationsTable.read, false)
				)
			);

		return { count: result?.count ?? 0 };
	}
}
