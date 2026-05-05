/** biome-ignore-all lint/style/noNonNullAssertion: sliced data can't be null */

import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, lt, sql } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { followsTable, profilesTable } from "@/db/schema";
import { computeViewerStatus } from "@/lib/server/helpers";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { followSchema } from "./follow.schema";

export class FollowService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async send({
		targetUserId,
	}: z.infer<typeof followSchema.send.input>): Promise<
		z.infer<typeof followSchema.send.output>
	> {
		if (this.userId === targetUserId)
			throw new ORPCError("BAD_REQUEST", { message: "Cannot follow yourself" });

		const [targetUserProfile] = await this.db
			.select({
				visibility: profilesTable.visibility,
			})
			.from(profilesTable)
			.where(eq(profilesTable.userId, targetUserId))
			.limit(1);

		if (!targetUserProfile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });
		await this.db
			.insert(followsTable)
			.values({
				followerId: this.userId,
				followingId: targetUserId,
				status:
					targetUserProfile.visibility === "public" ? "accepted" : "pending",
			})
			.onConflictDoNothing();

		return {
			success: true,
		};
	}

	async remove({
		targetUserId,
	}: z.infer<typeof followSchema.remove.input>): Promise<
		z.infer<typeof followSchema.remove.output>
	> {
		if (this.userId === targetUserId)
			throw new ORPCError("BAD_REQUEST", {
				message: "You cannot unfollow yourself",
			});

		const matchCondition = and(
			eq(followsTable.followingId, targetUserId),
			eq(followsTable.followerId, this.userId)
		);

		const [[targetUserProfile], [followObject]] = await Promise.all([
			this.db
				.select({
					visibility: profilesTable.visibility,
				})
				.from(profilesTable)
				.where(eq(profilesTable.userId, targetUserId))
				.limit(1),
			this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(matchCondition)
				.limit(1),
		]);

		if (!targetUserProfile)
			throw new ORPCError("NOT_FOUND", { message: "User not found" });

		if (!followObject)
			throw new ORPCError("NOT_FOUND", {
				message: "You are not following this user",
			});

		await this.db.delete(followsTable).where(matchCondition);

		return {
			success: true,
		};
	}

	async accept({
		followerId,
	}: z.infer<typeof followSchema.accept.input>): Promise<
		z.infer<typeof followSchema.accept.output>
	> {
		if (this.userId === followerId)
			throw new ORPCError("BAD_REQUEST", {
				message: "You cannot accept your own follow request",
			});

		const matchCondition = and(
			eq(followsTable.followingId, this.userId),
			eq(followsTable.followerId, followerId)
		);

		const [followObject] = await this.db
			.select({ status: followsTable.status })
			.from(followsTable)
			.where(matchCondition)
			.limit(1);

		if (!followObject)
			throw new ORPCError("NOT_FOUND", { message: "No follow request found" });

		if (followObject.status === "accepted")
			throw new ORPCError("CONFLICT", { message: "Already following" });

		await this.db
			.update(followsTable)
			.set({
				status: "accepted",
			})
			.where(matchCondition);

		return {
			success: true,
		};
	}

	async reject({
		followerId,
	}: z.infer<typeof followSchema.reject.input>): Promise<
		z.infer<typeof followSchema.reject.output>
	> {
		if (this.userId === followerId)
			throw new ORPCError("BAD_REQUEST", {
				message: "You cannot reject your own follow request",
			});

		const matchCondition = and(
			eq(followsTable.followingId, this.userId),
			eq(followsTable.followerId, followerId)
		);

		const [followObject] = await this.db
			.select({ status: followsTable.status })
			.from(followsTable)
			.where(matchCondition)
			.limit(1);

		if (!followObject)
			throw new ORPCError("NOT_FOUND", { message: "No follow request found" });

		if (followObject.status === "accepted")
			throw new ORPCError("CONFLICT", {
				message: "User is already following you",
			});

		await this.db.delete(followsTable).where(matchCondition);

		return { success: true };
	}

	async removeFollower({
		followerId,
	}: z.infer<typeof followSchema.removeFollower.input>): Promise<
		z.infer<typeof followSchema.removeFollower.output>
	> {
		if (this.userId === followerId)
			throw new ORPCError("BAD_REQUEST", {
				message: "You cannot remove yourself as a follower",
			});

		const matchCondition = and(
			eq(followsTable.followingId, this.userId),
			eq(followsTable.followerId, followerId)
		);

		const [followObject] = await this.db
			.select({ status: followsTable.status })
			.from(followsTable)
			.where(matchCondition)
			.limit(1);

		if (!followObject)
			throw new ORPCError("NOT_FOUND", {
				message: "This user is not following you",
			});

		await this.db.delete(followsTable).where(matchCondition);

		return { success: true };
	}

	async getStatus({
		targetUserId,
	}: z.infer<typeof followSchema.getStatus.input>): Promise<
		z.infer<typeof followSchema.getStatus.output>
	> {
		const theyFollowMeCondition = and(
			eq(followsTable.followerId, targetUserId),
			eq(followsTable.followingId, this.userId)
		);

		const theyFollowedByMeCondition = and(
			eq(followsTable.followerId, this.userId),
			eq(followsTable.followingId, targetUserId)
		);

		const [[theyFollowMe], [theyFollowedByMe]] = await Promise.all([
			this.db
				.select({
					status: followsTable.status,
				})
				.from(followsTable)
				.where(theyFollowMeCondition),
			this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(theyFollowedByMeCondition),
		]);

		const iFollow = theyFollowedByMe?.status;
		const theyFollow = theyFollowMe?.status;

		return { status: computeViewerStatus(iFollow, theyFollow) };
	}

	async getFollowers({
		userId,
		cursor,
	}: z.infer<typeof followSchema.getFollowers.input>): Promise<
		z.infer<typeof followSchema.getFollowers.output>
	> {
		const items = await this.db
			.select({
				id: profilesTable.id,
				userId: profilesTable.userId,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				avatarKey: profilesTable.avatarKey,
				bannerKey: profilesTable.bannerKey,
				bannerMimeType: profilesTable.bannerMimeType,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				pronouns: profilesTable.pronouns,
				bio: profilesTable.bio,
				visibility: profilesTable.visibility,
				updatedAt: profilesTable.updatedAt,
				createdAt: followsTable.createdAt,
				viewerFollowsStatus: this.db
					.select({ status: followsTable.status })
					.from(followsTable)
					.where(
						and(
							eq(followsTable.followerId, sql`${this.userId}`),
							eq(followsTable.followingId, profilesTable.userId)
						)
					)
					.limit(1)
					.as("viewer_follows_status"),
				profileFollowsViewerStatus: this.db
					.select({ status: followsTable.status })
					.from(followsTable)
					.where(
						and(
							eq(followsTable.followerId, profilesTable.userId),
							eq(followsTable.followingId, sql`${this.userId}`)
						)
					)
					.limit(1)
					.as("profile_follows_status"),
			})
			.from(followsTable)
			.innerJoin(
				profilesTable,
				eq(followsTable.followerId, profilesTable.userId)
			)
			.where(
				and(
					eq(followsTable.followingId, userId),
					eq(followsTable.status, "accepted"),
					cursor ? lt(followsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(followsTable.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.PROFILE_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
		const nextCursor = hasMore ? data.at(-1)!.createdAt : null;

		return {
			items: data.map(
				({
					avatarKey,
					bannerKey,
					viewerFollowsStatus,
					profileFollowsViewerStatus,
					...item
				}) => ({
					...item,
					avatarUrl: avatarKey
						? constructPublicUrl({ key: avatarKey, updatedAt: item.updatedAt })
								.publicUrl
						: null,
					bannerUrl: bannerKey
						? constructPublicUrl({ key: bannerKey, updatedAt: item.updatedAt })
								.publicUrl
						: null,
					viewerStatus: computeViewerStatus(
						viewerFollowsStatus,
						profileFollowsViewerStatus
					),
				})
			),
			nextCursor,
		};
	}

	async getFollowing({
		userId,
		cursor,
	}: z.infer<typeof followSchema.getFollowing.input>): Promise<
		z.infer<typeof followSchema.getFollowing.output>
	> {
		const items = await this.db
			.select({
				id: profilesTable.id,
				userId: profilesTable.userId,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				avatarKey: profilesTable.avatarKey,
				bannerKey: profilesTable.bannerKey,
				bannerMimeType: profilesTable.bannerMimeType,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				pronouns: profilesTable.pronouns,
				bio: profilesTable.bio,
				visibility: profilesTable.visibility,
				updatedAt: profilesTable.updatedAt,
				createdAt: followsTable.createdAt,
				viewerFollowsStatus: this.db
					.select({ status: followsTable.status })
					.from(followsTable)
					.where(
						and(
							eq(followsTable.followerId, sql`${this.userId}`),
							eq(followsTable.followingId, profilesTable.userId)
						)
					)
					.limit(1)
					.as("viewer_follows_status"),
				profileFollowsViewerStatus: this.db
					.select({ status: followsTable.status })
					.from(followsTable)
					.where(
						and(
							eq(followsTable.followerId, profilesTable.userId),
							eq(followsTable.followingId, sql`${this.userId}`)
						)
					)
					.limit(1)
					.as("profile_follows_status"),
			})
			.from(followsTable)
			.innerJoin(
				profilesTable,
				eq(followsTable.followingId, profilesTable.userId)
			)
			.where(
				and(
					eq(followsTable.followerId, userId),
					eq(followsTable.status, "accepted"),
					cursor ? lt(followsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(followsTable.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.PROFILE_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
		const nextCursor = hasMore ? data.at(-1)!.createdAt : null;

		return {
			items: data.map(
				({
					avatarKey,
					bannerKey,
					viewerFollowsStatus,
					profileFollowsViewerStatus,
					...item
				}) => ({
					...item,
					avatarUrl: avatarKey
						? constructPublicUrl({ key: avatarKey, updatedAt: item.updatedAt })
								.publicUrl
						: null,
					bannerUrl: bannerKey
						? constructPublicUrl({ key: bannerKey, updatedAt: item.updatedAt })
								.publicUrl
						: null,
					viewerStatus: computeViewerStatus(
						viewerFollowsStatus,
						profileFollowsViewerStatus
					),
				})
			),
			nextCursor,
		};
	}

	async getPendingReceived({
		cursor,
	}: z.infer<typeof followSchema.getPendingReceived.input>): Promise<
		z.infer<typeof followSchema.getPendingReceived.output>
	> {
		const items = await this.db
			.select({
				id: profilesTable.id,
				userId: profilesTable.userId,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				avatarKey: profilesTable.avatarKey,
				bannerKey: profilesTable.bannerKey,
				bannerMimeType: profilesTable.bannerMimeType,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				pronouns: profilesTable.pronouns,
				bio: profilesTable.bio,
				visibility: profilesTable.visibility,
				updatedAt: profilesTable.updatedAt,
				createdAt: followsTable.createdAt,
			})
			.from(followsTable)
			.innerJoin(
				profilesTable,
				eq(followsTable.followerId, profilesTable.userId)
			)
			.where(
				and(
					eq(followsTable.followingId, this.userId),
					eq(followsTable.status, "pending"),
					cursor ? lt(followsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(followsTable.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.PROFILE_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
		const nextCursor = hasMore ? data.at(-1)!.createdAt : null;

		return {
			items: data.map((item) => ({
				...item,
				avatarUrl: item.avatarKey
					? constructPublicUrl({
							key: item.avatarKey,
							updatedAt: item.updatedAt,
						}).publicUrl
					: null,
				bannerUrl: item.bannerKey
					? constructPublicUrl({
							key: item.bannerKey,
							updatedAt: item.updatedAt,
						}).publicUrl
					: null,
			})),
			nextCursor,
		};
	}

	async getPendingReceivedCount(): Promise<
		z.infer<typeof followSchema.getPendingReceivedCount.output>
	> {
		const [result] = await this.db
			.select({ value: count() })
			.from(followsTable)
			.where(
				and(
					eq(followsTable.followingId, this.userId),
					eq(followsTable.status, "pending")
				)
			);

		return {
			count: result?.value ?? 0,
		};
	}

	async getPendingSent({
		cursor,
	}: z.infer<typeof followSchema.getPendingSent.input>): Promise<
		z.infer<typeof followSchema.getPendingSent.output>
	> {
		const items = await this.db
			.select({
				id: profilesTable.id,
				userId: profilesTable.userId,
				username: profilesTable.username,
				displayName: profilesTable.displayName,
				avatarKey: profilesTable.avatarKey,
				bannerKey: profilesTable.bannerKey,
				bannerMimeType: profilesTable.bannerMimeType,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				pronouns: profilesTable.pronouns,
				bio: profilesTable.bio,
				visibility: profilesTable.visibility,
				updatedAt: profilesTable.updatedAt,
				createdAt: followsTable.createdAt,
			})
			.from(followsTable)
			.innerJoin(
				profilesTable,
				eq(followsTable.followingId, profilesTable.userId)
			)
			.where(
				and(
					eq(followsTable.followerId, this.userId),
					eq(followsTable.status, "pending"),
					cursor ? lt(followsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(followsTable.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		const hasMore = items.length > config.PROFILE_PAGINATION_LIMIT;
		const data = hasMore ? items.slice(0, -1) : items;
		const nextCursor = hasMore ? data.at(-1)!.createdAt : null;

		return {
			items: data.map((item) => ({
				...item,
				avatarUrl: item.avatarKey
					? constructPublicUrl({
							key: item.avatarKey,
							updatedAt: item.updatedAt,
						}).publicUrl
					: null,
				bannerUrl: item.bannerKey
					? constructPublicUrl({
							key: item.bannerKey,
							updatedAt: item.updatedAt,
						}).publicUrl
					: null,
			})),
			nextCursor,
		};
	}
}
