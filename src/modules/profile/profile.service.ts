/** biome-ignore-all lint/style/noNonNullAssertion: nextCursor can't be undefined */
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, ilike, lt, or, sql } from "drizzle-orm";
import {
	englishDataset,
	englishRecommendedTransformers,
	RegExpMatcher,
} from "obscenity";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { followsTable, profilesTable } from "@/db/schema";
import { computeViewerStatus } from "@/lib/server/helpers";
import {
	constructTempKey,
	getPermanentKey,
	getPresignedUploadUrl,
	moveFile,
} from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import { RESERVED_USERNAMES } from "@/lib/shared/constants";
import { constructPublicUrl } from "@/lib/shared/s3-utils";
import type { profileSchema } from "./profile.schema";

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

export class ProfileService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		username,
		userId,
	}: z.infer<typeof profileSchema.get.input>): Promise<
		z.infer<typeof profileSchema.get.output>
	> {
		if (!username && !userId) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Either username or userId must be provided",
			});
		}

		const queryCondition = userId
			? eq(profilesTable.userId, userId)
			: eq(profilesTable.username, username as string);

		const [profile] = await this.db
			.select()
			.from(profilesTable)
			.where(queryCondition)
			.limit(1);

		if (!profile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

		const [
			[{ followersCount }],
			[{ followingCount }],
			[viewerFollows],
			[profileFollowsViewer],
		] = await Promise.all([
			this.db
				.select({ followersCount: count() })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followingId, profile.userId),
						eq(followsTable.status, "accepted")
					)
				),
			this.db
				.select({ followingCount: count() })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, profile.userId),
						eq(followsTable.status, "accepted")
					)
				),
			this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, this.userId),
						eq(followsTable.followingId, profile.userId)
					)
				)
				.limit(1),
			this.db
				.select({ status: followsTable.status })
				.from(followsTable)
				.where(
					and(
						eq(followsTable.followerId, profile.userId),
						eq(followsTable.followingId, this.userId)
					)
				)
				.limit(1),
		]);

		const viewerStatus = computeViewerStatus(
			viewerFollows?.status,
			profileFollowsViewer?.status
		);

		return {
			id: profile.id,
			userId: profile.userId,
			username: profile.username,
			displayName: profile.displayName,
			bio: profile.bio,
			pronouns: profile.pronouns,
			isGlimpseVerified: profile.isGlimpseVerified,
			visibility: profile.visibility,
			avatarUrl: profile.avatarKey
				? constructPublicUrl({
						key: profile.avatarKey,
						updatedAt: profile.updatedAt,
					}).publicUrl
				: null,
			bannerUrl: profile.bannerKey
				? constructPublicUrl({
						key: profile.bannerKey,
						updatedAt: profile.updatedAt,
					}).publicUrl
				: null,
			bannerMimeType: profile.bannerMimeType,
			createdAt: profile.createdAt,
			updatedAt: profile.updatedAt,
			followersCount,
			followingCount,
			viewerStatus,
		};
	}

	async isUsernameAvailable({
		username,
	}: z.infer<typeof profileSchema.isUsernameAvailable.input>): Promise<
		z.infer<typeof profileSchema.isUsernameAvailable.output>
	> {
		const [result] = await this.db
			.select({ username: profilesTable.username })
			.from(profilesTable)
			.where(eq(profilesTable.username, username))
			.limit(1);

		if (
			result ||
			matcher.hasMatch(username) ||
			RESERVED_USERNAMES.has(username)
		)
			return { available: false };

		return {
			available: true,
		};
	}

	async onboard({
		username,
		displayName,
		avatarKey,
	}: z.infer<typeof profileSchema.onboard.input>): Promise<
		z.infer<typeof profileSchema.onboard.output>
	> {
		const permanentKey = avatarKey
			? getPermanentKey({ tempKey: avatarKey }).permanentKey
			: null;

		const { available } = await this.isUsernameAvailable({ username });

		if (!available) {
			throw new ORPCError("CONFLICT", { message: "Username already taken" });
		}

		await this.db.transaction(async (tx) => {
			await tx.insert(profilesTable).values({
				userId: this.userId,
				username,
				displayName,
				avatarKey: permanentKey,
			});

			if (avatarKey && permanentKey) {
				await moveFile({ fromKey: avatarKey, toKey: permanentKey });
			}
		});

		return { success: true };
	}

	async update({
		username,
		bio,
		displayName,
		pronouns,
		visibility,
	}: z.infer<typeof profileSchema.update.input>): Promise<
		z.infer<typeof profileSchema.update.output>
	> {
		if (
			username === undefined &&
			bio === undefined &&
			displayName === undefined &&
			pronouns === undefined &&
			visibility === undefined
		) {
			throw new ORPCError("BAD_REQUEST", { message: "Nothing to update" });
		}

		if (username) {
			const { available } = await this.isUsernameAvailable({ username });
			if (!available)
				throw new ORPCError("CONFLICT", { message: "Username already taken" });
		}

		if (displayName && matcher.hasMatch(displayName)) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Display name contains inappropriate language",
			});
		}

		try {
			const [updated] = await this.db
				.update(profilesTable)
				.set({
					...(username !== undefined && { username }),
					...(bio !== undefined && { bio }),
					...(displayName !== undefined && { displayName }),
					...(pronouns !== undefined && { pronouns }),
					...(visibility !== undefined && { visibility }),
				})
				.where(eq(profilesTable.userId, this.userId))
				.returning();
			if (!updated)
				throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

			return {
				success: true,
			};
		} catch (e) {
			if (e instanceof DatabaseError && e.code === "23505") {
				throw new ORPCError("CONFLICT", { message: "Username already taken" });
			}
			throw e;
		}
	}

	async getAvatarPresignedUrl({
		mimeType,
	}: z.infer<typeof profileSchema.getAvatarPresignedUrl.input>): Promise<
		z.infer<typeof profileSchema.getAvatarPresignedUrl.output>
	> {
		const key = constructTempKey(`avatar/${this.userId}`);

		const { presignedUrl } = await getPresignedUploadUrl({
			contentType: mimeType,
			key,
		});

		return {
			presignedUrl,
			key,
		};
	}

	async getBannerPresignedUrl({
		mimeType,
	}: z.infer<typeof profileSchema.getBannerPresignedUrl.input>): Promise<
		z.infer<typeof profileSchema.getBannerPresignedUrl.output>
	> {
		const key = constructTempKey(`banner/${this.userId}`);

		const { presignedUrl } = await getPresignedUploadUrl({
			contentType: mimeType,
			key,
		});

		return {
			presignedUrl,
			key,
		};
	}

	async updateAvatar({
		key,
	}: z.infer<typeof profileSchema.updateAvatar.input>): Promise<
		z.infer<typeof profileSchema.updateAvatar.output>
	> {
		const { permanentKey } = getPermanentKey({ tempKey: key });

		await this.db.transaction(async (tx) => {
			await tx
				.update(profilesTable)
				.set({ avatarKey: permanentKey })
				.where(eq(profilesTable.userId, this.userId));

			await moveFile({ fromKey: key, toKey: permanentKey });
		});

		return { success: true };
	}

	async updateBanner({
		key,
		mimeType,
	}: z.infer<typeof profileSchema.updateBanner.input>): Promise<
		z.infer<typeof profileSchema.updateBanner.output>
	> {
		const { permanentKey } = getPermanentKey({ tempKey: key });

		await this.db.transaction(async (tx) => {
			await tx
				.update(profilesTable)
				.set({ bannerKey: permanentKey, bannerMimeType: mimeType })
				.where(eq(profilesTable.userId, this.userId));

			await moveFile({ fromKey: key, toKey: permanentKey });
		});

		return { success: true };
	}

	async search({
		query,
		cursor,
	}: z.infer<typeof profileSchema.search.input>): Promise<
		z.infer<typeof profileSchema.search.output>
	> {
		let items = await this.db
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
				createdAt: profilesTable.createdAt,
				updatedAt: profilesTable.updatedAt,
				followersCount: this.db.$count(
					followsTable,
					and(
						eq(followsTable.followingId, profilesTable.userId),
						eq(followsTable.status, "accepted")
					)
				),
				followingCount: this.db.$count(
					followsTable,
					and(
						eq(followsTable.followerId, profilesTable.userId),
						eq(followsTable.status, "accepted")
					)
				),
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
			.from(profilesTable)
			.where(
				and(
					or(
						ilike(profilesTable.username, `%${query}%`),
						ilike(profilesTable.displayName, `%${query}%`)
					),
					cursor ? lt(profilesTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(profilesTable.createdAt))
			.limit(config.PROFILE_PAGINATION_LIMIT + 1);

		let nextCursor = null;

		if (items.length > config.PROFILE_PAGINATION_LIMIT) {
			nextCursor = items.at(-1)!.createdAt;
			items = items.slice(0, -1);
		}

		const mappedItems = items.map(
			({
				avatarKey,
				bannerKey,
				viewerFollowsStatus,
				profileFollowsViewerStatus,
				...profile
			}) => ({
				...profile,
				avatarUrl: avatarKey
					? constructPublicUrl({ key: avatarKey, updatedAt: profile.updatedAt })
							.publicUrl
					: null,
				bannerUrl: bannerKey
					? constructPublicUrl({ key: bannerKey, updatedAt: profile.updatedAt })
							.publicUrl
					: null,
				viewerStatus: computeViewerStatus(
					viewerFollowsStatus,
					profileFollowsViewerStatus
				),
			})
		);

		return {
			items: mappedItems,
			nextCursor,
		};
	}
}
