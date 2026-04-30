import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { profilesTable } from "@/db/schema";
import { constructPublicUrl } from "@/lib/server/s3-utils";
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
		const [profile] = await this.db
			.select()
			.from(profilesTable)
			.where(eq(profilesTable.username, username))
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
			avatarMimeType: profile.avatarMimeType,
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

		if (result) return { available: false };

		return {
			available: true,
		};
	}
}
