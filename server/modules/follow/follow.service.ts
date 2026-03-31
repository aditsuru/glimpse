import { and, desc, eq, lt, sql } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { followersTable, profilesTable, user } from "@/drizzle/schema";
import { config } from "@/lib/config";
import { paginateResult } from "@/server/shared/helpers/paginate";
import { getFollowingsCount } from "@/server/shared/queries/follow";
import type { followSchema } from "./follow.schema";

export class FollowService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async getFollowers({
		nextCursor,
	}: z.infer<typeof followSchema.getFollowers.input>): Promise<
		z.infer<typeof followSchema.getFollowers.output>
	> {
		const followers = await this.db
			.select({
				profileId: user.id,
				avatarUrl: profilesTable.avatarUrl,
				username: user.username,
				name: user.name,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				createdAt: user.createdAt,
				isFollowingUser:
					sql<boolean>`EXISTS(SELECT 1 FROM ${followersTable} WHERE ${followersTable.followerId} = ${this.userId} AND ${followersTable.followingId} = ${user.id})`.as(
						"is_following_user"
					),
				isFollowedByUser:
					sql<boolean>`EXISTS(SELECT 1 FROM ${followersTable} WHERE ${followersTable.followerId} = ${user.id} AND ${followersTable.followingId} = ${this.userId})`.as(
						"is_followed_by_user"
					),
			})
			.from(user)
			.innerJoin(profilesTable, eq(profilesTable.userId, user.id))
			.innerJoin(
				followersTable,
				and(
					eq(followersTable.followerId, user.id),
					eq(followersTable.followingId, this.userId)
				)
			)
			.where(nextCursor ? lt(user.createdAt, nextCursor) : undefined)
			.orderBy(desc(user.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		return paginateResult(
			followers,
			config.PROFILE_PAGINATION_LIMIT,
			(item) => item.createdAt
		);
	}

	async getFollowings({
		nextCursor,
	}: z.infer<typeof followSchema.getFollowings.input>): Promise<
		z.infer<typeof followSchema.getFollowings.output>
	> {
		const followings = await this.db
			.select({
				profileId: user.id,
				avatarUrl: profilesTable.avatarUrl,
				username: user.username,
				name: user.name,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				createdAt: user.createdAt,
				isFollowingUser:
					sql<boolean>`EXISTS(SELECT 1 FROM ${followersTable} WHERE ${followersTable.followerId} = ${this.userId} AND ${followersTable.followingId} = ${user.id})`.as(
						"is_following_user"
					),
				isFollowedByUser:
					sql<boolean>`EXISTS(SELECT 1 FROM ${followersTable} WHERE ${followersTable.followerId} = ${user.id} AND ${followersTable.followingId} = ${this.userId})`.as(
						"is_followed_by_user"
					),
			})
			.from(user)
			.innerJoin(profilesTable, eq(profilesTable.userId, user.id))
			.innerJoin(
				followersTable,
				and(
					eq(followersTable.followingId, user.id),
					eq(followersTable.followerId, this.userId)
				)
			)
			.where(nextCursor ? lt(user.createdAt, nextCursor) : undefined)
			.orderBy(desc(user.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		return paginateResult(
			followings,
			config.PROFILE_PAGINATION_LIMIT,
			(item) => item.createdAt
		);
	}

	async add({
		followingId,
	}: z.infer<typeof followSchema.add.input>): Promise<
		z.infer<typeof followSchema.add.output>
	> {
		await this.db
			.insert(followersTable)
			.values({
				followerId: this.userId,
				followingId,
			})
			.onConflictDoNothing();

		return await getFollowingsCount({ userId: followingId });
	}

	async remove({
		followingId,
	}: z.infer<typeof followSchema.remove.input>): Promise<
		z.infer<typeof followSchema.remove.output>
	> {
		await this.db
			.delete(followersTable)
			.where(
				and(
					eq(followersTable.followerId, this.userId),
					eq(followersTable.followingId, followingId)
				)
			);

		return await getFollowingsCount({ userId: followingId });
	}
}
