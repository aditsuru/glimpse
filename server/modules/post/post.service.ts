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
	profilesTable,
	user,
} from "@/drizzle/schema";
import { confirmUpload, deleteFile } from "@/lib/helpers/s3-helper";
import { logger } from "@/lib/logger";
import type { AttachmentSchema, postSchema } from "./post.schema";

export class PostService {
	constructor(private db: typeof DBType) {}

	async get({
		postId,
		viewerId,
	}: z.infer<typeof postSchema.get.input> & {
		viewerId: string;
	}): Promise<z.infer<typeof postSchema.get.output>> {
		const [post] = await this.db
			.select({
				id: postsTable.id,
				body: postsTable.body,
				createdAt: postsTable.createdAt,
				hasAttachments: postsTable.hasAttachments,
				userId: postsTable.userId,
				views: postsTable.views,
				likes: count(postLikesTable.userId).as("likes"),
				comments: count(commentsTable.id).as("comments"),
				bookmarks: count(bookmarksTable.userId).as("bookmarks"),
				authorName: user.name,
				authorUsername: user.username,
				authorAvatarUrl: profilesTable.avatarUrl,
				authorIsVerified: profilesTable.isGlimpseVerified,
			})
			.from(postsTable)
			.leftJoin(postLikesTable, eq(postLikesTable.postId, postsTable.id))
			.leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
			.leftJoin(bookmarksTable, eq(bookmarksTable.postId, postsTable.id))
			.innerJoin(user, eq(user.id, postsTable.userId))
			.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
			.where(eq(postsTable.id, postId))
			.groupBy(postsTable.id);

		if (!post) {
			throw new ORPCError("NOT_FOUND", { message: "Post not found" });
		}

		const {
			id,
			body,
			createdAt,
			hasAttachments,
			userId,
			views,
			likes,
			comments,
			bookmarks,
			authorAvatarUrl,
			authorIsVerified,
			authorName,
			authorUsername,
		} = post;

		const [hasUserLikedQuery, hasUserBookmarkedQuery] = await Promise.all([
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
			likes: Number(likes),
			comments: Number(comments),
			bookmarks: Number(bookmarks),
			hasUserLiked: hasUserLikedQuery.length > 0,
			hasUserBookmarked: hasUserBookmarkedQuery.length > 0,
			attachments: hasAttachments ? attachments : undefined,
			authorAvatarUrl,
			authorIsVerified,
			authorName,
			authorUsername,
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
		};
	}

	async delete({
		postId,
		userId,
	}: z.infer<typeof postSchema.delete.input> & {
		userId: string;
	}): Promise<z.infer<typeof postSchema.delete.output>> {
		const keys = await this.db.transaction(async (tx) => {
			const [post] = await tx
				.select()
				.from(postsTable)
				.where(and(eq(postsTable.id, postId), eq(postsTable.userId, userId)))
				.limit(1);

			if (!post) {
				throw new ORPCError("NOT_FOUND", {
					message: "Post not found or you do not have permission to delete it.",
				});
			}

			let keys: string[] = [];
			if (post.hasAttachments) {
				const attachments = await tx
					.select({
						fileKey: attachmentsTable.fileKey,
					})
					.from(attachmentsTable)
					.where(eq(attachmentsTable.postId, postId));

				keys = attachments.map(({ fileKey }) => fileKey);
			}

			await tx.delete(postsTable).where(eq(postsTable.id, postId));
			return keys;
		});

		if (keys.length > 0) {
			Promise.all(
				keys.map(async (fileKey) => {
					await deleteFile(fileKey);
				})
			).catch((err) => logger.error("Failed to cleanup S3 files:", err));
		}

		return {
			postId,
		};
	}
}
