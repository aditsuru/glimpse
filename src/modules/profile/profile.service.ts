import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import {
	englishDataset,
	englishRecommendedTransformers,
	RegExpMatcher,
} from "obscenity";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { profilesTable } from "@/db/schema";
import {
	constructPublicUrl,
	constructTempKey,
	getPermanentKey,
	getPresignedUploadUrl,
	moveFile,
} from "@/lib/server/s3-utils";
import { RESERVED_USERNAMES } from "@/lib/shared/constants";
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

		return {
			userId: profile.userId,
			username: profile.username,
			displayName: profile.displayName,
			bio: profile.bio,
			pronouns: profile.pronouns,
			isGlimpseVerified: profile.isGlimpseVerified,
			visibility: profile.visibility,
			avatarUrl: profile.avatarKey
				? constructPublicUrl({ key: profile.avatarKey }).publicUrl
				: null,
			bannerUrl: profile.bannerKey
				? constructPublicUrl({ key: profile.bannerKey }).publicUrl
				: null,
			bannerMimeType: profile.bannerMimeType,
			createdAt: profile.createdAt,
			updatedAt: profile.updatedAt,
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
		if (!username && !bio && !displayName && !pronouns && !visibility) {
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
					...(username && { username }),
					...(bio && { bio }),
					...(displayName && { displayName }),
					...(pronouns && { pronouns }),
					...(visibility && { visibility }),
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
}
