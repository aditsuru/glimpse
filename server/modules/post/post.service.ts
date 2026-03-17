import { ORPCError } from "@orpc/server";
import { and, count, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	attachmentsTable,
	bookmarksTable,
	commentsTable,
	postLikesTable,
	postsTable,
} from "@/drizzle/schema";
import { confirmUpload } from "@/lib/helpers/s3-helper";
import type { AttachmentSchema, postSchema } from "./post.schema";

export class PostService {
	constructor(private db: typeof DBType) {}

	async get({
		postId,
		viewerId,
	}: z.infer<typeof postSchema.get.input> & {
		viewerId: string;
	}): Promise<z.infer<typeof postSchema.get.output>> {
		const post = (
			await this.db.select().from(postsTable).where(eq(postsTable.id, postId))
		)[0];

		if (!post) {
			throw new ORPCError("NOT_FOUND", { message: "Post not found" });
		}

		const { id, body, createdAt, hasAttachments, userId, views } = post;

		// TODO: optimize with joins
		const [
			likesCount,
			commentsCount,
			bookmarksCount,
			hasUserLikedQuery,
			hasUserBookmarkedQuery,
		] = await Promise.all([
			this.db
				.select({ count: count() })
				.from(postLikesTable)
				.where(eq(postLikesTable.postId, id)),
			this.db
				.select({ count: count() })
				.from(commentsTable)
				.where(eq(commentsTable.postId, id)),
			this.db
				.select({ count: count() })
				.from(bookmarksTable)
				.where(eq(bookmarksTable.postId, id)),
			this.db
				.select()
				.from(postLikesTable)
				.where(
					and(
						eq(postLikesTable.postId, id),
						eq(postLikesTable.userId, viewerId)
					)
				)
				.limit(1),
			this.db
				.select()
				.from(bookmarksTable)
				.where(
					and(
						eq(bookmarksTable.postId, id),
						eq(bookmarksTable.userId, viewerId)
					)
				)
				.limit(1),
		]);

		let attachments: Omit<z.infer<typeof AttachmentSchema>, "fileKey">[] = [];

		if (hasAttachments) {
			attachments = await this.db
				.select({
					fileUrl: attachmentsTable.fileUrl,
					fileType: attachmentsTable.fileType,
				})
				.from(attachmentsTable)
				.where(eq(attachmentsTable.postId, id));
		}

		return {
			id,
			createdAt,
			body: body ? body : undefined,
			hasAttachments,
			userId,
			views,
			likes: Number(likesCount[0].count),
			comments: Number(commentsCount[0].count),
			bookmarks: Number(bookmarksCount[0].count),
			hasUserLiked: hasUserLikedQuery.length > 0,
			hasUserBookmarked: hasUserBookmarkedQuery.length > 0,
			attachments: hasAttachments ? attachments : undefined,
		};
	}

	async create({
		attachments,
		body,
		userId,
	}: z.infer<typeof postSchema.create.input> & {
		userId: string;
	}): Promise<z.infer<typeof postSchema.create.output>> {
		if (!attachments && !body)
			throw new ORPCError("BAD_REQUEST", {
				message:
					"Post cannot be empty. Please provide either a text body or at least one attachment.",
			});

		const validatedAttachments =
			attachments && attachments.length > 0
				? await Promise.all(
						attachments.map(async (attr) => {
							const fileData = await confirmUpload(attr.fileKey);
							return {
								fileKey: fileData.fileKey,
								fileUrl: fileData.fileUrl,
								fileType: attr.fileType,
							};
						})
					)
				: [];

		const postId = await this.db.transaction(async (tx) => {
			const [newPost] = await tx
				.insert(postsTable)
				.values({
					userId,
					body: body ? body : undefined,
					hasAttachments: attachments ? attachments?.length > 0 : false,
				})
				.returning();

			if (attachments && attachments.length > 0) {
				await tx
					.insert(attachmentsTable)
					.values(
						validatedAttachments.map((attr) => ({
							postId: newPost.id,
							fileUrl: attr.fileUrl,
							fileType: attr.fileType,
							fileKey: attr.fileKey,
						}))
					)
					.returning();
			}

			return newPost.id;
		});

		return {
			postId,
			success: true,
		};
	}
}
