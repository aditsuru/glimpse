import { and, desc, inArray, lt, notInArray, sql } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { commentsTable, postLikesTable, postsTable } from "@/drizzle/schema";
import { config } from "@/lib/config";
import { getSeenPostIds } from "@/server/shared/helpers/redis";
import { fetchAttachmentsMap } from "@/server/shared/queries/attachments";
import {
	fetchPostPage,
	fetchUserBookmarkedPostIds,
	fetchUserLikedPostIds,
} from "@/server/shared/queries/post";
import type { feedSchema } from "./feed.schema";

export class FeedService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		nextCursor,
	}: z.infer<typeof feedSchema.get.input>): Promise<
		z.infer<typeof feedSchema.get.output>
	> {
		const source = nextCursor?.source || "db";
		const limit = config.POSTS_PAGINATION_LIMIT;

		let newCursor = {
			source,
			cursor: nextCursor?.cursor || null,
		};

		let posts: Awaited<ReturnType<typeof fetchPostPage>> = [];

		const seenPostsIds = await getSeenPostIds(this.userId);

		if (source === "redis") {
			let startIndex = 0;

			if (nextCursor?.cursor && typeof nextCursor.cursor === "string") {
				const cursorIndex = seenPostsIds.indexOf(nextCursor.cursor);
				startIndex = cursorIndex === -1 ? 0 : cursorIndex + 1;
			}

			const postIdsToFetch = seenPostsIds.slice(startIndex, startIndex + limit);

			if (postIdsToFetch.length > 0) {
				posts = await fetchPostPage(
					this.db,
					limit + 1,
					inArray(postsTable.id, postIdsToFetch)
				);
			}

			newCursor = {
				source: "redis",
				cursor: seenPostsIds[startIndex + limit] ?? null,
			};
		} else if (source === "db") {
			// Calculate P (Engagement)
			const points = sql`((count(${postLikesTable.userId}) * 2) + (count(${commentsTable.id}) * 5) + ${postsTable.views})`;

			// Calculate T (Time in hours)
			const hoursOld = sql`EXTRACT(EPOCH FROM (now() - ${postsTable.createdAt})) / 3600`;

			const algorithmScore = sql`(${points} - 1) / POW((${hoursOld} + 2), 1.8)`;

			posts = await fetchPostPage(
				this.db,
				limit + 1,
				and(
					seenPostsIds.length > 0
						? notInArray(postsTable.id, seenPostsIds)
						: undefined,
					nextCursor?.cursor instanceof Date
						? lt(postsTable.createdAt, nextCursor.cursor)
						: undefined
				),
				desc(algorithmScore)
			);

			const hasNextPage = posts.length > limit;

			newCursor = {
				source: hasNextPage ? "db" : "redis",
				cursor: hasNextPage ? posts[limit - 1].createdAt : null,
			};
		}

		if (posts.length === 0) {
			return {
				items: [],
				nextCursor: newCursor,
			};
		}

		const hasNextPage = posts.length > limit;
		const pagePosts = hasNextPage ? posts.slice(0, limit) : posts;
		const postIds = pagePosts.map((post) => post.id);

		const [bookmarkedSet, likedSet, attachmentsMap] = await Promise.all([
			fetchUserBookmarkedPostIds(this.db, this.userId, postIds),
			fetchUserLikedPostIds(this.db, this.userId, postIds),
			fetchAttachmentsMap(this.db, pagePosts),
		]);

		const items = pagePosts.map((post) => ({
			...post,
			likes: Number(post.likes),
			comments: Number(post.comments),
			bookmarks: Number(post.bookmarks),
			body: post.body ?? undefined,
			hasUserLiked: likedSet.has(post.id),
			hasUserBookmarked: bookmarkedSet.has(post.id),
			attachments: attachmentsMap.get(post.id) ?? undefined,
		}));

		return {
			items,
			nextCursor: newCursor,
		};
	}
}
