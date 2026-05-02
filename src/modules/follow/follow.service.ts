import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { followsTable, profilesTable } from "@/db/schema";
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
}
