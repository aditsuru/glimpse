import { and, desc, eq, lt } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { followersTable, profilesTable, user } from "@/drizzle/schema";
import { config } from "@/lib/config";
import { getFollowingsCount } from "@/server/shared/follow.helper";
import { paginateResult } from "@/server/shared/paginate.helper";
import type { followSchema } from "./follow.schema";

export class FollowService {
	constructor(private db: typeof DBType) {}

	async getFollowers({
		nextCursor,
		userId,
	}: z.infer<typeof followSchema.getFollowers.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.getFollowers.output>> {
		const followers = await this.db
			.select({
				profileId: user.id,
				avatarUrl: profilesTable.avatarUrl,
				username: user.username,
				name: user.name,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				createdAt: user.createdAt,
			})
			.from(user)
			.innerJoin(profilesTable, eq(profilesTable.userId, user.id))
			.innerJoin(
				followersTable,
				and(
					eq(followersTable.followerId, user.id),
					eq(followersTable.followingId, userId)
				)
			)
			.where(nextCursor ? lt(user.createdAt, nextCursor) : undefined)
			.groupBy(user.id)
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
		userId,
	}: z.infer<typeof followSchema.getFollowings.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.getFollowings.output>> {
		const followings = await this.db
			.select({
				profileId: user.id,
				avatarUrl: profilesTable.avatarUrl,
				username: user.username,
				name: user.name,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				createdAt: user.createdAt,
			})
			.from(user)
			.innerJoin(profilesTable, eq(profilesTable.userId, user.id))
			.innerJoin(
				followersTable,
				and(
					eq(followersTable.followingId, user.id),
					eq(followersTable.followerId, userId)
				)
			)
			.where(nextCursor ? lt(user.createdAt, nextCursor) : undefined)
			.groupBy(user.id)
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
		userId,
	}: z.infer<typeof followSchema.add.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.add.output>> {
		await this.db
			.insert(followersTable)
			.values({
				followerId: userId,
				followingId,
			})
			.onConflictDoNothing();

		return await getFollowingsCount({ userId: followingId });
	}

	async remove({
		followingId,
		userId,
	}: z.infer<typeof followSchema.remove.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.remove.output>> {
		await this.db
			.delete(followersTable)
			.where(
				and(
					eq(followersTable.followerId, userId),
					eq(followersTable.followingId, followingId)
				)
			);

		return await getFollowingsCount({ userId: followingId });
	}
}
