import { ORPCError } from "@orpc/server";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import {
	attachmentsTable,
	followsTable,
	postsTable,
	profilesTable,
} from "@/db/schema";
import { viewHistoryTable } from "@/db/schema/view-history";
import { customNanoid } from "@/lib/server/helpers";
import {
	getPostViews,
	getPostViewsBatch,
	getViewHistory,
	isPostSeen,
	markPostSeen as markPostSeenHelper,
} from "@/lib/server/redis-utils";
import {
	constructPublicUrl,
	constructTempKey,
	deleteFile,
	getPermanentKey,
	getPresignedUploadUrl,
	moveFile,
} from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";
import type { postSchema } from "./post.schema";

export class PostService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async markPostSeen({
		postId,
	}: z.infer<typeof postSchema.markPostSeen.input>): Promise<
		z.infer<typeof postSchema.markPostSeen.output>
	> {
		const [[isSeenDB], isSeenRedis] = await Promise.all([
			this.db
				.select()
				.from(viewHistoryTable)
				.where(
					and(
						eq(viewHistoryTable.userId, this.userId),
						eq(viewHistoryTable.postId, postId)
					)
				)
				.limit(1),
			isPostSeen(this.userId, postId),
		]);

		if (!isSeenDB && !isSeenRedis)
			await markPostSeenHelper(this.userId, postId);

		return {
			success: true,
		};
	}

	async getAttachmentPresignedUrl({
		mimeType,
	}: z.infer<typeof postSchema.getAttachmentPresignedUrl.input>): Promise<
		z.infer<typeof postSchema.getAttachmentPresignedUrl.output>
	> {
		const key = constructTempKey(`attachment/${this.userId}/${customNanoid()}`);

		const { presignedUrl } = await getPresignedUploadUrl({
			contentType: mimeType,
			key,
		});

		return {
			presignedUrl,
			key,
		};
	}

	async create({
		attachments,
		body,
		spoiler,
	}: z.infer<typeof postSchema.create.input>): Promise<
		z.infer<typeof postSchema.create.output>
	> {
		const hasAttachments = !!(attachments && attachments.length > 0);

		if (!hasAttachments && !body)
			throw new ORPCError("BAD_REQUEST", { message: "Post cannot be empty" });

		if (hasAttachments) {
			const hasVideo = attachments.some((a) => a.mimeType.startsWith("video/"));
			const hasImage = attachments.some((a) => a.mimeType.startsWith("image/"));

			if (hasVideo && attachments.length > 1)
				throw new ORPCError("BAD_REQUEST", {
					message: "Only one video allowed",
				});

			if (hasVideo && hasImage)
				throw new ORPCError("BAD_REQUEST", {
					message: "Cannot mix video and images",
				});
		}

		const attachmentsWithKeys = hasAttachments
			? // biome-ignore lint/style/noNonNullAssertion: attachments is not null
				attachments!.map((a) => ({
					mimeType: a.mimeType,
					tempKey: a.attachmentKey,
					permanentKey: getPermanentKey({ tempKey: a.attachmentKey })
						.permanentKey,
				}))
			: [];

		const postId = await this.db.transaction(async (tsx) => {
			const [post] = await tsx
				.insert(postsTable)
				.values({ userId: this.userId, hasAttachments, body, spoiler })
				.returning();

			if (hasAttachments) {
				await tsx.insert(attachmentsTable).values(
					attachmentsWithKeys.map((a) => ({
						attachmentKey: a.permanentKey,
						mimeType: a.mimeType,
						postId: post.id,
					}))
				);

				await Promise.all(
					attachmentsWithKeys.map((a) =>
						moveFile({ fromKey: a.tempKey, toKey: a.permanentKey })
					)
				);
			}

			return post.id;
		});

		return { postId };
	}

	async delete({
		postId,
	}: z.infer<typeof postSchema.delete.input>): Promise<
		z.infer<typeof postSchema.delete.output>
	> {
		const [post] = await this.db
			.select({ hasAttachments: postsTable.hasAttachments })
			.from(postsTable)
			.where(and(eq(postsTable.id, postId), eq(postsTable.userId, this.userId)))
			.limit(1);

		if (!post) throw new ORPCError("NOT_FOUND", { message: "Post not found" });

		await this.db.transaction(async (tsx) => {
			const attachments = await tsx
				.select({
					attachmentKey: attachmentsTable.attachmentKey,
				})
				.from(attachmentsTable)
				.where(eq(attachmentsTable.postId, postId));

			await tsx
				.delete(postsTable)
				.where(
					and(eq(postsTable.id, postId), eq(postsTable.userId, this.userId))
				);

			if (post.hasAttachments) {
				await Promise.all(
					attachments.map((a) => deleteFile({ key: a.attachmentKey }))
				);
			}
		});

		return {
			success: true,
		};
	}

	async get({
		postId,
	}: z.infer<typeof postSchema.get.input>): Promise<
		z.infer<typeof postSchema.get.output>
	> {
		const [post] = await this.db
			.select({
				id: postsTable.id,
				userId: postsTable.userId,
				body: postsTable.body,
				views: postsTable.views,
				spoiler: postsTable.spoiler,
				hasAttachments: postsTable.hasAttachments,
				createdAt: postsTable.createdAt,
				updatedAt: postsTable.updatedAt,
				attachments: sql<{ attachmentKey: string; mimeType: string }[]>`
					COALESCE(
					  json_agg(
						json_build_object(
						  'attachmentKey', ${attachmentsTable.attachmentKey},
						  'mimeType', ${attachmentsTable.mimeType}
						)
					  ) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL),
					  '[]'
					)
				`,
				// profile fields
				authorId: profilesTable.userId,
				authorUsername: profilesTable.username,
				authorDisplayName: profilesTable.displayName,
				authorIsGlimpseVerified: profilesTable.isGlimpseVerified,
				authorAvatarKey: profilesTable.avatarKey,
				authorAvatarUpdatedAt: profilesTable.updatedAt,
				authorVisibility: profilesTable.visibility,
			})
			.from(postsTable)
			.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
			.leftJoin(attachmentsTable, eq(attachmentsTable.postId, postsTable.id))
			.where(eq(postsTable.id, postId))
			.groupBy(postsTable.id, profilesTable.id)
			.limit(1);

		if (!post) throw new ORPCError("NOT_FOUND", { message: "Post not found" });

		// visibility check
		if (post.authorVisibility === "private" && post.userId !== this.userId) {
			const [follow] = await this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, this.userId),
						eq(followsTable.followingId, post.userId),
						eq(followsTable.status, "accepted")
					)
				)
				.limit(1);

			if (!follow)
				throw new ORPCError("FORBIDDEN", {
					message: "This profile is private",
				});
		}

		return {
			...post,
			views: post.views + (await getPostViews(post.id)),
			author: {
				id: post.authorId,
				username: post.authorUsername,
				displayName: post.authorDisplayName,
				isGlimpseVerified: post.authorIsGlimpseVerified,
				avatarUrl: post.authorAvatarKey
					? constructPublicUrl({
							key: post.authorAvatarKey,
							updatedAt: post.authorAvatarUpdatedAt,
						}).publicUrl
					: null,
			},
			attachments: post.attachments.map((a) => ({
				mimeType: a.mimeType as (typeof ALLOWED_MIME_TYPES.attachment)[number],
				url: constructPublicUrl({
					key: a.attachmentKey,
					updatedAt: post.updatedAt,
				}).publicUrl,
			})),
		};
	}

	async getAllByUser({
		username,
		cursor,
	}: z.infer<typeof postSchema.getAllByUser.input>): Promise<
		z.infer<typeof postSchema.getAllByUser.output>
	> {
		const [profile] = await this.db
			.select({
				userId: profilesTable.userId,
				visibility: profilesTable.visibility,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				avatarKey: profilesTable.avatarKey,
				avatarUpdatedAt: profilesTable.updatedAt,
			})
			.from(profilesTable)
			.where(eq(profilesTable.username, username))
			.limit(1);

		if (!profile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

		if (profile.visibility === "private" && profile.userId !== this.userId) {
			const [follow] = await this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, this.userId),
						eq(followsTable.followingId, profile.userId),
						eq(followsTable.status, "accepted")
					)
				)
				.limit(1);

			if (!follow)
				throw new ORPCError("FORBIDDEN", {
					message: "This profile is private",
				});
		}

		const author = {
			id: profile.userId,
			username: profile.username,
			displayName: profile.displayName,
			isGlimpseVerified: profile.isGlimpseVerified,
			avatarUrl: profile.avatarKey
				? constructPublicUrl({
						key: profile.avatarKey,
						updatedAt: profile.avatarUpdatedAt,
					}).publicUrl
				: null,
		};

		const seenIds = await getViewHistory(this.userId);

		const items = await this.db
			.select({
				id: postsTable.id,
				userId: postsTable.userId,
				body: postsTable.body,
				views: postsTable.views,
				hasAttachments: postsTable.hasAttachments,
				spoiler: postsTable.spoiler,
				createdAt: postsTable.createdAt,
				updatedAt: postsTable.updatedAt,
				attachments: sql<{ attachmentKey: string; mimeType: string }[]>`
					COALESCE(
					  json_agg(
						json_build_object(
						  'attachmentKey', ${attachmentsTable.attachmentKey},
						  'mimeType', ${attachmentsTable.mimeType}
						)
					  ) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL),
					  '[]'
					)
				`,
			})
			.from(postsTable)
			.leftJoin(attachmentsTable, eq(attachmentsTable.postId, postsTable.id))
			.where(
				and(
					eq(postsTable.userId, profile.userId),
					cursor ? lt(postsTable.createdAt, cursor) : undefined
				)
			)
			.groupBy(postsTable.id)
			.orderBy(
				seenIds.length > 0
					? sql`CASE WHEN ${postsTable.id} = ANY(ARRAY[${sql.raw(seenIds.map((id) => `'${id}'`).join(","))}]::text[]) THEN 1 ELSE 0 END`
					: desc(postsTable.createdAt),
				desc(postsTable.createdAt)
			)
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.POSTS_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
		// biome-ignore lint/style/noNonNullAssertion: data cannot be null
		const nextCursor = hasMore ? data.at(-1)!.createdAt : null;

		const viewsMap = await getPostViewsBatch(data.map((p) => p.id));

		return {
			items: data.map(({ attachments, ...post }) => ({
				...post,
				author,
				views: post.views + (viewsMap.get(post.id) ?? 0),
				attachments: attachments.map((a) => ({
					mimeType:
						a.mimeType as (typeof ALLOWED_MIME_TYPES.attachment)[number],
					url: constructPublicUrl({
						key: a.attachmentKey,
						updatedAt: post.updatedAt,
					}).publicUrl,
				})),
			})),
			nextCursor,
		};
	}
}
