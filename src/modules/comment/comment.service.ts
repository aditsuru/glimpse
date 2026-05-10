/** biome-ignore-all lint/style/noNonNullAssertion: same as Post Service */
import { ORPCError } from "@orpc/server";
import {
	and,
	count,
	desc,
	eq,
	getTableColumns,
	isNull,
	lt,
	ne,
	sql,
} from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { profilesTable } from "@/db/schema";
import { commentsTable } from "@/db/schema/comments";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { postSchema } from "../post/post.schema";
import type { commentSchema, getCommentOutput } from "./comment.schema";

export class CommentService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async create({
		body,
		postId,
	}: z.infer<typeof commentSchema.create.input>): Promise<
		z.infer<typeof commentSchema.create.output>
	> {
		if (!body.trim())
			throw new ORPCError("BAD_REQUEST", {
				message: "Comment cannot be empty.",
			});

		await this.db.insert(commentsTable).values({
			body,
			postId,
			userId: this.userId,
		});

		return {
			success: true,
		};
	}

	async delete({
		commentId,
	}: z.infer<typeof commentSchema.delete.input>): Promise<
		z.infer<typeof commentSchema.delete.output>
	> {
		await this.db.delete(commentsTable).where(eq(commentsTable.id, commentId));

		return {
			success: true,
		};
	}

	async getCount({
		postId,
	}: z.infer<typeof commentSchema.getCount.input>): Promise<
		z.infer<typeof commentSchema.getCount.output>
	> {
		const data = await this.db
			.select({
				count: count(),
			})
			.from(commentsTable)
			.where(eq(commentsTable.postId, postId))
			.then((i) => i[0]);

		return {
			count: data.count,
		};
	}

	async getPostComments({
		postId,
		cursor,
		highlight,
	}: z.infer<typeof commentSchema.getPostComments.input>): Promise<
		z.infer<typeof commentSchema.getPostComments.output>
	> {
		const selectColumns = {
			...getTableColumns(commentsTable),
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
		};

		const viewerComments = !cursor
			? await this.db
					.select(selectColumns)
					.from(commentsTable)
					.leftJoin(
						profilesTable,
						eq(commentsTable.userId, profilesTable.userId)
					)
					.where(
						and(
							eq(commentsTable.postId, postId),
							eq(commentsTable.userId, this.userId),
							isNull(commentsTable.parentCommentId)
						)
					)
					.groupBy(commentsTable.id, profilesTable.id)
					.orderBy(desc(commentsTable.createdAt))
			: [];

		const otherComments = await this.db
			.select(selectColumns)
			.from(commentsTable)
			.leftJoin(profilesTable, eq(commentsTable.userId, profilesTable.userId))
			.where(
				and(
					eq(commentsTable.postId, postId),
					isNull(commentsTable.parentCommentId),
					ne(commentsTable.userId, this.userId),
					cursor ? lt(commentsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(
				...(!cursor && highlight
					? [
							sql`CASE WHEN ${commentsTable.id} = ${highlight} THEN 1 ELSE 2 END`,
						]
					: []),
				desc(commentsTable.createdAt)
			)
			.groupBy(commentsTable.id, profilesTable.id)
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		const hasNext = otherComments.length > config.COMMENTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? otherComments.slice(0, -1) : otherComments;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		const comments = [
			...this.mapComments(viewerComments),
			...this.mapComments(trimmed),
		];

		const items = comments.sort((a, b) =>
			a.id === highlight ? -1 : b.id === highlight ? 1 : 0
		);

		return {
			items,
			nextCursor,
		};
	}

	private mapComments(
		data: (z.infer<typeof getCommentOutput> & {
			authorAvatarUpdatedAt: Date | null;
		})[]
	) {
		return data.map((comment) => {
			return {
				...comment,
				parentCommentId: null,
				author: {
					...comment.author,
					avatarUrl:
						comment.author.avatarUrl && comment.authorAvatarUpdatedAt
							? constructPublicUrl({
									key: comment.author.avatarUrl,
									updatedAt: comment.authorAvatarUpdatedAt,
								}).publicUrl
							: null,
				},
			};
		});
	}
}
