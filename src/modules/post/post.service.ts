/** biome-ignore-all lint/style/noNonNullAssertion: none */
import { ORPCError } from "@orpc/server";
import { and, desc, eq, getTableColumns, lt, sql } from "drizzle-orm";
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
		const [isSeenDB, isSeenRedis] = await Promise.all([
			this.db
				.select()
				.from(viewHistoryTable)
				.where(
					and(
						eq(viewHistoryTable.userId, this.userId),
						eq(viewHistoryTable.postId, postId)
					)
				)
				.limit(1)
				.then((i) => i[0]),
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
			? attachments!.map((a) => ({
					mimeType: a.mimeType,
					tempKey: a.attachmentKey,
					permanentKey: getPermanentKey({ tempKey: a.attachmentKey })
						.permanentKey,
				}))
			: [];

		const postId = await this.db.transaction(async (tsx) => {
			const post = await tsx
				.insert(postsTable)
				.values({ userId: this.userId, hasAttachments, body, spoiler })
				.returning()
				.then((p) => p[0]);

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
		const post = await this.db
			.select({
				...getTableColumns(postsTable),
				authorVisibility: profilesTable.visibility,
				authorAvatarUpdatedAt: profilesTable.updatedAt,
				author: sql<z.infer<typeof postSchema.get.output.shape.author>>`
				json_build_object(
				'id', ${profilesTable.userId},
				'username', ${profilesTable.username},
				'displayName', ${profilesTable.displayName},
				'isGlimpseVerified', ${profilesTable.isGlimpseVerified},
				'avatarUrl', ${profilesTable.avatarKey}
				)
				`,
				attachments: sql<
					z.infer<typeof postSchema.get.output.shape.attachments>
				>`
				COALESCE(
				json_agg(
				json_build_object(
				'mimeType', ${attachmentsTable.mimeType},
				'url', ${attachmentsTable.attachmentKey}
				)
				ORDER BY ${attachmentsTable.createdAt} DESC
				) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL)
				, '[]')
				`,
			})
			.from(postsTable)
			.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
			.leftJoin(attachmentsTable, eq(attachmentsTable.postId, postId))
			.where(eq(postsTable.id, postId))
			.groupBy(postsTable.id, profilesTable.id)
			.limit(1)
			.then((i) => i[0]);

		if (!post) throw new ORPCError("NOT_FOUND", { message: "Post not found" });

		if (post.authorVisibility === "private" && post.userId !== this.userId) {
			const followExists = await this.db
				.select({ createdAt: followsTable.createdAt })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, this.userId),
						eq(followsTable.followingId, post.userId),
						eq(followsTable.status, "accepted")
					)
				)
				.then((i) => i.length > 0);

			if (!followExists)
				throw new ORPCError("FORBIDDEN", {
					message: "This profile is private",
				});
		}

		return {
			...post,
			views: post.views + (await getPostViews(postId)),
			author: {
				...post.author,
				avatarUrl: post.author.avatarUrl
					? constructPublicUrl({
							key: post.author.avatarUrl,
							updatedAt: post.authorAvatarUpdatedAt,
						}).publicUrl
					: null,
			},
			attachments: post.attachments.map((a) => {
				return {
					...a,
					url: constructPublicUrl({ key: a.url, updatedAt: post.updatedAt })
						.publicUrl,
				};
			}),
		};
	}

	async getAllByUser({
		username,
		cursor,
	}: z.infer<typeof postSchema.getAllByUser.input>): Promise<
		z.infer<typeof postSchema.getAllByUser.output>
	> {
		const authorProfile = await this.db
			.select({
				id: profilesTable.userId,
				visibility: profilesTable.visibility,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				updatedAt: profilesTable.updatedAt,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				avatarUrl: profilesTable.avatarKey,
			})
			.from(profilesTable)
			.where(eq(profilesTable.username, username))
			.limit(1)
			.then((i) => i[0]);

		if (!authorProfile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

		if (
			authorProfile.visibility === "private" &&
			authorProfile.id !== this.userId
		) {
			const followExists = await this.db
				.select({ createdAt: followsTable.createdAt })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, this.userId),
						eq(followsTable.followingId, authorProfile.id),
						eq(followsTable.status, "accepted")
					)
				)
				.then((i) => i.length > 0);

			if (!followExists)
				throw new ORPCError("FORBIDDEN", {
					message: "This profile is private",
				});
		}

		const posts = await this.db
			.select({
				...getTableColumns(postsTable),
				attachments: sql<
					z.infer<typeof postSchema.get.output.shape.attachments>
				>`
				COALESCE(
				json_agg(
				json_build_object(
				'mimeType', ${attachmentsTable.mimeType},
				'url', ${attachmentsTable.attachmentKey}
				)
				ORDER BY ${attachmentsTable.createdAt} DESC
				) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL)
				, '[]')
				`,
			})
			.from(postsTable)
			.leftJoin(attachmentsTable, eq(postsTable.id, attachmentsTable.postId))
			.where(
				and(
					eq(postsTable.userId, authorProfile.id),
					cursor ? lt(postsTable.createdAt, cursor) : undefined
				)
			)
			.groupBy(postsTable.id)
			.limit(config.POSTS_PAGINATION_LIMIT + 1)
			.orderBy(desc(postsTable.createdAt));

		const hasNext = posts.length > config.POSTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? posts.slice(0, -1) : posts;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		const viewsMap = await getPostViewsBatch(trimmed.map((p) => p.id));

		const mappedPosts = trimmed.map((post) => {
			return {
				...post,
				views: post.views + (viewsMap.get(post.id) ?? 0),
				author: {
					...authorProfile,
					avatarUrl: authorProfile.avatarUrl
						? constructPublicUrl({
								key: authorProfile.avatarUrl,
								updatedAt: authorProfile.updatedAt,
							}).publicUrl
						: null,
				},
				attachments: post.attachments.map((a) => {
					return {
						...a,
						url: constructPublicUrl({ key: a.url, updatedAt: post.updatedAt })
							.publicUrl,
					};
				}),
			};
		});

		return {
			items: mappedPosts,
			nextCursor,
		};
	}

	async getFeed({
		cursor,
	}: z.infer<typeof postSchema.getFeed.input>): Promise<
		z.infer<typeof postSchema.getFeed.output>
	> {
		const [seenPostIdsRedis, seenPostIdsDB] = await Promise.all([
			getViewHistory(this.userId),
			this.db
				.select({
					postId: viewHistoryTable.postId,
				})
				.from(viewHistoryTable)
				.where(eq(viewHistoryTable.userId, this.userId))
				.orderBy(desc(viewHistoryTable.createdAt))
				.then((posts) => posts.map((i) => i.postId)),
		]);

		const seenPostIds = [...new Set([...seenPostIdsRedis, ...seenPostIdsDB])];

		const posts = await this.db
			.select({
				...getTableColumns(postsTable),
				authorAvatarUpdatedAt: profilesTable.updatedAt,
				author: sql<z.infer<typeof postSchema.get.output.shape.author>>`
				json_build_object(
				'id', ${profilesTable.userId},
				'username', ${profilesTable.username},
				'displayName', ${profilesTable.displayName},
				'isGlimpseVerified', ${profilesTable.isGlimpseVerified},
				'avatarUrl', ${profilesTable.avatarKey}
				)
				`,
				attachments: sql<
					z.infer<typeof postSchema.get.output.shape.attachments>
				>`
				COALESCE(
				json_agg(
				json_build_object(
				'mimeType', ${attachmentsTable.mimeType},
				'url', ${attachmentsTable.attachmentKey}
				)
				ORDER BY ${attachmentsTable.createdAt} DESC
				) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL)
				, '[]')
				`,
			})
			.from(postsTable)
			.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
			.leftJoin(attachmentsTable, eq(postsTable.id, attachmentsTable.postId))
			.innerJoin(
				followsTable,
				and(
					eq(sql`${this.userId}`, followsTable.followerId),
					eq(postsTable.userId, followsTable.followingId),
					eq(followsTable.status, "accepted")
				)
			)
			.where(cursor ? lt(postsTable.createdAt, cursor) : undefined)
			.groupBy(postsTable.id, profilesTable.id)
			.orderBy(
				seenPostIds.length > 0
					? sql`CASE WHEN ${postsTable.id} = ANY(ARRAY[${sql.join(
							seenPostIds.map((id) => sql`${id}`),
							sql`, `
						)}]) THEN 1 ELSE 0 END`
					: sql`0`,
				desc(postsTable.createdAt)
			)
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const hasNext = posts.length > config.POSTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? posts.slice(0, -1) : posts;
		const isFirstPage = !cursor;
		const unseenTrimmed = trimmed.filter((p) => !seenPostIds.includes(p.id));
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		if (!isFirstPage && unseenTrimmed.length === 0) {
			return { items: [], nextCursor: null };
		}

		const viewsMap = await getPostViewsBatch(trimmed.map((p) => p.id));

		const mappedPosts = trimmed.map((post) => {
			return {
				...post,
				views: post.views + (viewsMap.get(post.id) ?? 0),
				author: {
					...post.author,
					avatarUrl: post.author.avatarUrl
						? constructPublicUrl({
								key: post.author.avatarUrl,
								updatedAt: post.authorAvatarUpdatedAt,
							}).publicUrl
						: null,
				},
				attachments: post.attachments.map((a) => {
					return {
						...a,
						url: constructPublicUrl({ key: a.url, updatedAt: post.updatedAt })
							.publicUrl,
					};
				}),
			};
		});

		return {
			items: mappedPosts,
			nextCursor,
		};
	}
}
