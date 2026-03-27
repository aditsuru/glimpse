import { ORPCError } from "@orpc/server";
import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { headers } from "next/headers";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { profilesTable, user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import { config } from "@/lib/config";
import {
	getFollowersCount,
	getFollowingsCount,
} from "@/server/shared/follow.helper";
import {
	confirmUpload,
	deleteFile,
	getPermanentKeyAndUrl,
} from "@/server/shared/s3.helper";
import type { profileSchema } from "./profile.schema";

export class ProfileService {
	constructor(private db: typeof DBType) {}

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
		userId,
		name,
		username,
		...args
	}: z.infer<typeof profileSchema.update.input> & {
		userId: string;
	}): Promise<z.infer<typeof profileSchema.update.output>> {
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
			.where(eq(profilesTable.userId, userId))
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
				.where(eq(profilesTable.userId, userId)),

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

		const hasNextPage = profiles.length > config.PROFILE_PAGINATION_LIMIT;

		const items = hasNextPage
			? profiles.slice(0, config.PROFILE_PAGINATION_LIMIT)
			: profiles;

		return {
			items,
			nextCursor: hasNextPage ? items[items.length - 1].username : null,
		};
	}
}
