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

	async get(): Promise<z.infer<typeof profileSchema.get.output>> {
		const [profile] = await this.db
			.select()
			.from(profilesTable)
			.where(eq(profilesTable.userId, this.userId));
		if (!profile)
			throw new ORPCError("NOT_FOUND", { message: "Profile not found" });

		return {
			userId: profile.userId,
			username: profile.username,
			displayName: profile.displayName,
			bio: profile.bio,
			pronouns: profile.pronouns,
			isGlimpseVerified: profile.isGlimpseVerified,
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
}
