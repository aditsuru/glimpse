// AI GENERATED SEED SCRIPT

import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { faker } from "@faker-js/faker";
import { eq, like } from "drizzle-orm";
import { db } from "@/db";
import { followsTable, profilesTable } from "@/db/schema";
import { user as userTable } from "@/db/schema/auth-schema";
import { config } from "@/lib/shared/config";

const COUNT = parseInt(process.argv[2] ?? "5", 10);
const DELAY_MS = 50;
const PFP_RANGE = { start: 1, end: 25 };
const BANNER_RANGE = { start: 1, end: 15 };

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MIME_TYPES: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
	".gif": "image/gif",
};

const s3 = new S3Client({
	endpoint: config.S3_ENDPOINT,
	region: "auto",
	credentials: {
		accessKeyId: config.R2_ACCESS_KEY_ID,
		secretAccessKey: config.R2_SECRET_ACCESS_KEY,
	},
	forcePathStyle: true,
});

async function uploadFile(
	localPath: string,
	key: string,
	mimeType: string
): Promise<string> {
	await s3.send(
		new PutObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			Key: key,
			Body: fs.readFileSync(localPath),
			ContentType: mimeType,
		})
	);
	return key;
}

async function uploadSeedAvatar(i: number): Promise<string> {
	const len = PFP_RANGE.end - PFP_RANGE.start + 1;
	const fileIndex = PFP_RANGE.start + ((i - 1) % len);
	const localPath = path.resolve(`./public/static/temp/pfp/${fileIndex}.jpg`);
	return uploadFile(
		localPath,
		`avatars/seed/pfp-${fileIndex}.jpg`,
		"image/jpeg"
	);
}

async function uploadSeedBanner(
	i: number
): Promise<{ key: string; mimeType: string }> {
	const len = BANNER_RANGE.end - BANNER_RANGE.start + 1;
	const fileIndex = BANNER_RANGE.start + ((i - 1) % len);
	const dir = path.resolve(`./public/static/temp/banner`);
	const match = fs
		.readdirSync(dir)
		.find((f) => path.parse(f).name === String(fileIndex));

	if (!match)
		throw new Error(`No banner file found for index ${fileIndex} in ${dir}`);

	const ext = path.extname(match).toLowerCase();
	const mimeType = MIME_TYPES[ext] ?? "image/jpeg";
	const localPath = path.join(dir, match);
	const key = await uploadFile(
		localPath,
		`banners/seed/banner-${fileIndex}${ext}`,
		mimeType
	);
	return { key, mimeType };
}

async function cleanSeedUsers() {
	console.log("cleaning previous seed users...");
	const existing = await db
		.select()
		.from(userTable)
		.where(like(userTable.email, "seed%@test.com"));

	for (const u of existing) {
		await db.delete(profilesTable).where(eq(profilesTable.userId, u.id));
		await db.delete(userTable).where(eq(userTable.id, u.id));
	}
}

async function seedUsers(count: number) {
	console.log(`seeding ${count} users...`);
	const createdIds: string[] = [];

	for (let i = 1; i <= count; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const id = crypto.randomUUID();

		await db.insert(userTable).values({
			id,
			email: `seed${i}@test.com`,
			name: `${firstName} ${lastName}`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const avatarKey = await uploadSeedAvatar(i);
		const { key: bannerKey, mimeType: bannerMimeType } =
			await uploadSeedBanner(i);

		await db
			.insert(profilesTable)
			.values({
				userId: id,
				username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`,
				displayName: `${firstName} ${lastName}`,
				bio: faker.lorem.sentence(),
				pronouns: "she/her",
				avatarKey,
				bannerKey,
				bannerMimeType,
			})
			.onConflictDoNothing();

		createdIds.push(id);
		await delay(DELAY_MS);
	}

	return createdIds;
}

async function seedFollows(userIds: string[]) {
	if (userIds.length < 2) return;
	console.log("seeding follows...");

	for (let i = 0; i < userIds.length; i++) {
		const others = userIds.filter((_, j) => j !== i);
		const followCount = faker.number.int({
			min: 1,
			max: Math.min(5, others.length),
		});
		const targets = faker.helpers.arrayElements(others, followCount);

		for (const targetId of targets) {
			await db
				.insert(followsTable)
				.values({
					followerId: userIds[i],
					followingId: targetId,
					status: "accepted",
				})
				.onConflictDoNothing();
			await delay(DELAY_MS);
		}
	}
}

async function seed() {
	const start = Date.now();
	await cleanSeedUsers();
	const userIds = await seedUsers(COUNT);
	await seedFollows(userIds);
	const elapsed = ((Date.now() - start) / 1000).toFixed(1);
	console.log(`done in ${elapsed}s  |  seeded ${COUNT} users`);
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
