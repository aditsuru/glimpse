/** biome-ignore-all lint/style/noNonNullAssertion: none */
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, lt, type SQL, sql } from "drizzle-orm";
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
			? attachments!.map((a) => ({
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
			.orderBy(desc(postsTable.createdAt))
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.POSTS_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
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

	async getFeed({
		cursor,
	}: z.infer<typeof postSchema.getFeed.input>): Promise<
		z.infer<typeof postSchema.getFeed.output>
	> {
		const following = await this.db
			.select({ userId: followsTable.followingId })
			.from(followsTable)
			.where(
				and(
					eq(followsTable.followerId, this.userId),
					eq(followsTable.status, "accepted")
				)
			);

		if (following.length === 0) return { items: [], nextCursor: null };

		const followingIds = following.map((f) => f.userId);
		const seenIds = await getViewHistory(this.userId);
		const isFirstPage = !cursor;

		const fetchPosts = (
			extraWhere: SQL | undefined,
			limit = config.POSTS_PAGINATION_LIMIT
		) =>
			this.db
				.select({
					id: postsTable.id,
					userId: postsTable.userId,
					body: postsTable.body,
					views: postsTable.views,
					spoiler: postsTable.spoiler,
					hasAttachments: postsTable.hasAttachments,
					createdAt: postsTable.createdAt,
					postUpdatedAt: postsTable.updatedAt,
					authorId: profilesTable.userId,
					authorUsername: profilesTable.username,
					authorDisplayName: profilesTable.displayName,
					authorIsVerified: profilesTable.isGlimpseVerified,
					authorAvatarKey: profilesTable.avatarKey,
					authorAvatarUpdatedAt: profilesTable.updatedAt,
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
				.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
				.leftJoin(attachmentsTable, eq(attachmentsTable.postId, postsTable.id))
				.where(extraWhere)
				.groupBy(
					postsTable.id,
					profilesTable.userId,
					profilesTable.username,
					profilesTable.displayName,
					profilesTable.isGlimpseVerified,
					profilesTable.avatarKey,
					profilesTable.updatedAt
				)
				.orderBy(desc(postsTable.createdAt))
				.limit(limit + 1);

		type RawPost = Awaited<ReturnType<typeof fetchPosts>>[number];

		const mapItems = async (
			raw: RawPost[]
		): Promise<z.infer<typeof postSchema.get.output>[]> => {
			const hasMore = raw.length > config.POSTS_PAGINATION_LIMIT;
			const data = hasMore ? raw.slice(0, -1) : raw;
			const viewsMap = await getPostViewsBatch(data.map((p) => p.id));

			return data.map(
				({
					attachments,
					authorId,
					authorUsername,
					authorDisplayName,
					authorIsVerified,
					authorAvatarKey,
					authorAvatarUpdatedAt,
					postUpdatedAt,
					...post
				}) => ({
					...post,
					updatedAt: postUpdatedAt,
					views: post.views + (viewsMap.get(post.id) ?? 0),
					author: {
						id: authorId,
						username: authorUsername,
						displayName: authorDisplayName,
						isGlimpseVerified: authorIsVerified,
						avatarUrl: authorAvatarKey
							? constructPublicUrl({
									key: authorAvatarKey,
									updatedAt: authorAvatarUpdatedAt,
								}).publicUrl
							: null,
					},
					attachments: attachments.map((a) => ({
						mimeType:
							a.mimeType as (typeof ALLOWED_MIME_TYPES.attachment)[number],
						url: constructPublicUrl({
							key: a.attachmentKey,
							updatedAt: postUpdatedAt,
						}).publicUrl,
					})),
				})
			);
		};

		const getNextCursor = (
			raw: RawPost[],
			data: RawPost[],
			limit = config.POSTS_PAGINATION_LIMIT
		): Date | null => (raw.length > limit ? data.at(-1)!.createdAt : null);

		const baseWhere = and(
			inArray(postsTable.userId, followingIds),
			cursor ? lt(postsTable.createdAt, cursor) : undefined
		);

		const unseenWhere =
			seenIds.length > 0
				? and(
						baseWhere,
						sql`${postsTable.id} != ALL(ARRAY[${sql.raw(seenIds.map((id) => `'${id}'`).join(","))}]::text[])`
					)
				: baseWhere;

		const seenWhere = and(
			baseWhere,
			sql`${postsTable.id} = ANY(ARRAY[${sql.raw(seenIds.map((id) => `'${id}'`).join(","))}]::text[])`
		);

		// subsequent pages — unseen only
		if (!isFirstPage) {
			const raw = await fetchPosts(unseenWhere);
			const data =
				raw.length > config.POSTS_PAGINATION_LIMIT ? raw.slice(0, -1) : raw;
			return {
				items: await mapItems(raw),
				nextCursor: getNextCursor(raw, data),
			};
		}

		// first page — fetch unseen
		const unseenRaw = await fetchPosts(unseenWhere);
		const unseenData =
			unseenRaw.length > config.POSTS_PAGINATION_LIMIT
				? unseenRaw.slice(0, -1)
				: unseenRaw;

		if (unseenData.length >= config.POSTS_PAGINATION_LIMIT) {
			// full page of unseen, no backfill needed
			return {
				items: await mapItems(unseenRaw),
				nextCursor: getNextCursor(unseenRaw, unseenData),
			};
		}

		// partial unseen — backfill with seen posts
		const remaining = config.POSTS_PAGINATION_LIMIT - unseenData.length;
		if (remaining > 0 && seenIds.length > 0) {
			const seenRaw = await fetchPosts(seenWhere, remaining);
			const seenData =
				seenRaw.length > remaining ? seenRaw.slice(0, -1) : seenRaw;
			const combined = [...unseenData, ...seenData];
			const hasMore = seenRaw.length > remaining;
			return {
				items: await mapItems(combined),
				nextCursor: hasMore ? combined.at(-1)!.createdAt : null,
			};
		}

		return { items: await mapItems(unseenRaw), nextCursor: null };
	}
}
