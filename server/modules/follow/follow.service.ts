import { and, count, desc, eq, lt } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { followersTable, profilesTable, user } from "@/drizzle/schema";
import { config } from "@/lib/config";
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

		const hasNextPage = followers.length > config.PROFILE_PAGINATION_LIMIT;

		const items = hasNextPage
			? followers.slice(0, config.PROFILE_PAGINATION_LIMIT)
			: followers;

		return {
			items,
			nextCursor: hasNextPage ? items[items.length - 1].createdAt : null,
		};
	}

	async getFollowings({
		nextCursor,
		userId,
	}: z.infer<typeof followSchema.getFollowers.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.getFollowers.output>> {
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

		const hasNextPage = followings.length > config.PROFILE_PAGINATION_LIMIT;

		const items = hasNextPage
			? followings.slice(0, config.PROFILE_PAGINATION_LIMIT)
			: followings;

		return {
			items,
			nextCursor: hasNextPage ? items[items.length - 1].createdAt : null,
		};
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

		return await this.getFollowingsCount({ followingId });
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

		return await this.getFollowingsCount({ followingId });
	}

	private async getFollowingsCount({
		followingId,
	}: {
		followingId: string;
	}): Promise<{ count: number }> {
		const [{ count: followingsCount }] = await this.db
			.select({ count: count() })
			.from(followersTable)
			.where(eq(followersTable.followingId, followingId));

		return {
			count: Number(followingsCount),
		};
	}
}
