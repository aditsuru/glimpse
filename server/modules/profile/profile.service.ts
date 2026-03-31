import { ORPCError } from "@orpc/server";
import { and, asc, eq, gt, ilike, sql } from "drizzle-orm";
import { headers } from "next/headers";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { profilesTable, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import { RESERVED_USERNAMES } from "@/lib/constants";
import { paginateResult } from "@/server/shared/helpers/paginate";
import { isSafe } from "@/server/shared/helpers/profanity";
import {
	confirmUpload,
	deleteFile,
	getPermanentKeyAndUrl,
} from "@/server/shared/helpers/s3";
import {
	getFollowersCount,
	getFollowingsCount,
} from "@/server/shared/queries/follow";
import type { profileSchema } from "./profile.schema";

export class ProfileService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		username,
	}: z.infer<typeof profileSchema.get.input>): Promise<
		z.infer<typeof profileSchema.get.output>
	> {
		const [userProfile] = await this.db
			.select({
				avatarUrl: profilesTable.avatarUrl,
				bannerUrl: profilesTable.bannerUrl,
				username: user.username,
				name: user.name,
				bio: profilesTable.bio,
				website: profilesTable.website,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				userId: profilesTable.userId,
			})
			.from(profilesTable)
			.innerJoin(user, eq(profilesTable.userId, user.id))
			.where(eq(user.username, username))
			.limit(1);

		if (!userProfile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

		const [{ count: followersCount }, { count: followingsCount }] =
			await Promise.all([
				getFollowersCount({ userId: userProfile.userId }),
				getFollowingsCount({ userId: userProfile.userId }),
			]);

		return {
			...userProfile,
			followersCount,
			followingsCount,
		};
	}

	async update({
		name,
		username,
		...args
	}: z.infer<typeof profileSchema.update.input>): Promise<
		z.infer<typeof profileSchema.update.output>
	> {
		const { avatarKey, avatarUrl, bannerKey, bannerUrl } = args;

		const profileUpdateData = { ...args };
		const fileOperations = [];

		if (avatarKey && avatarUrl) {
			const avatar = getPermanentKeyAndUrl(avatarKey);
			profileUpdateData.avatarKey = avatar.permanentKey;
			profileUpdateData.avatarUrl = avatar.fileUrl;

			fileOperations.push(confirmUpload(avatarKey));
		}

		if (bannerKey && bannerUrl) {
			const banner = getPermanentKeyAndUrl(bannerKey);
			profileUpdateData.bannerKey = banner.permanentKey;
			profileUpdateData.bannerUrl = banner.fileUrl;

			fileOperations.push(confirmUpload(bannerKey));
		}

		const [currentProfile] = await this.db
			.select({
				avatarKey: profilesTable.avatarKey,
				bannerKey: profilesTable.bannerKey,
			})
			.from(profilesTable)
			.where(eq(profilesTable.userId, this.userId))
			.limit(1);

		if (avatarKey && currentProfile?.avatarKey) {
			fileOperations.push(deleteFile(currentProfile.avatarKey));
		}
		if (bannerKey && currentProfile?.bannerKey) {
			fileOperations.push(deleteFile(currentProfile.bannerKey));
		}

		await Promise.all([
			this.db
				.update(profilesTable)
				.set(profileUpdateData)
				.where(eq(profilesTable.userId, this.userId)),

			name !== undefined || username !== undefined
				? auth.api.updateUser({
						body: { name, username },
						headers: await headers(),
					})
				: Promise.resolve(),
		]);

		await Promise.allSettled(fileOperations);

		return {
			success: true,
		};
	}

	async searchUsers({
		query,
		nextCursor,
	}: z.infer<typeof profileSchema.searchUsers.input>): Promise<
		z.infer<typeof profileSchema.searchUsers.output>
	> {
		const profiles = await this.db
			.select({
				username: user.username,
				name: user.name,
				avatarUrl: profilesTable.avatarUrl,
				isGlimpseVerified: profilesTable.isGlimpseVerified,
				createdAt: user.createdAt,
			})
			.from(user)
			.innerJoin(profilesTable, eq(profilesTable.userId, user.id))
			.where(
				and(
					ilike(user.username, `${query}%`),
					nextCursor ? gt(user.username, nextCursor) : undefined
				)
			)
			.orderBy(asc(user.username))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		return paginateResult(
			profiles,
			config.PROFILE_PAGINATION_LIMIT,
			(item) => item.username
		);
	}

	async checkUsername({
		username,
	}: z.infer<typeof profileSchema.checkUsername.input>): Promise<
		z.infer<typeof profileSchema.checkUsername.output>
	> {
		username = username.toLowerCase();

		if (!isSafe(username) || RESERVED_USERNAMES.has(username))
			return {
				isAvailable: false,
			};

		const result = await this.db
			.select({ id: user.id })
			.from(user)
			.where(sql`lower(${user.username}) = ${username}`)
			.limit(1);

		const isAvailable = result.length === 0;

		return {
			isAvailable,
		};
	}
}
