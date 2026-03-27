import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { profilesTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import {
	confirmUpload,
	deleteFile,
	getPermanentKeyAndUrl,
} from "@/lib/helpers/s3-helper";
import type { profileSchema } from "./profile.schema";

export class ProfileService {
	constructor(private db: typeof DBType) {}

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
}
