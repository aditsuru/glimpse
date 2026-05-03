/** biome-ignore-all lint/suspicious/noExplicitAny: none */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { followsTable, profilesTable } from "@/db/schema";
import { user as userTable } from "@/db/schema/auth-schema";
import { auth } from "@/lib/server/auth"; // adjust path if needed
import { config } from "@/lib/shared/config";

// ─── Config ───────────────────────────────────────────────────────────────────

const COUNT = parseInt(process.argv[2] ?? "5", 10);
const PASSWORD = "Password123!";
const DELAY_MS = 50;
const PFP_RANGE = { start: 1, end: 21 }; // /static/temp/pfp/1.jpg … 8.jpg (inclusive)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function seedUsers(count: number) {
	console.log(`seeding ${count} users...`);
	const createdIds: string[] = [];

	for (let i = 1; i <= count; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
		const email = `seed${i}@test.com`;

		let created: any;
		try {
			const result = await auth.api.signUpEmail({
				body: { name: `${firstName} ${lastName}`, email, password: PASSWORD },
				asResponse: false, // ← ensure you get data back, not a raw Response
			});
			created = result.user;
		} catch (err: any) {
			// User likely already exists — look them up instead
			console.warn(
				`  signup failed for ${email}: ${err.message ?? err}. Skipping.`
			);
			continue;
		}

		if (!created?.id) {
			console.warn(`  no user returned for ${email}, skipping.`);
			continue;
		}

		await db
			.update(userTable)
			.set({ emailVerified: true })
			.where(eq(userTable.id, created.id));

		const avatarKey = await uploadSeedAvatar(i);

		await db
			.insert(profilesTable)
			.values({
				userId: created.id,
				username,
				displayName: `${firstName} ${lastName}`,
				bio: faker.lorem.sentence(),
				pronouns: i % 2 === 0 ? "he/him" : "she/her",
				avatarKey: avatarKey,
			})
			.onConflictDoNothing();

		createdIds.push(created.id);
		await delay(DELAY_MS);
	}

	return createdIds;
}

async function seedFollows(userIds: string[]) {
	if (userIds.length < 2) return;
	console.log("seeding follows...");

	for (let i = 0; i < userIds.length; i++) {
		const next = (i + 1) % userIds.length;
		await db
			.insert(followsTable)
			.values({
				followerId: userIds[i],
				followingId: userIds[next],
				status: "accepted",
			})
			.onConflictDoNothing();
		await delay(DELAY_MS);
	}
}

// ─── Add more seeders here ────────────────────────────────────────────────────
// async function seedPosts(userIds: string[]) { ... }

// ─── Clean  ──────────────────────────────────────────────────────────────────────

async function cleanSeedUsers(count: number) {
	console.log("cleaning previous seed users...");
	for (let i = 1; i <= count; i++) {
		const email = `seed${i}@test.com`;
		const existing = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (existing[0]) {
			await db
				.delete(profilesTable)
				.where(eq(profilesTable.userId, existing[0].id));
			await db.delete(userTable).where(eq(userTable.id, existing[0].id));
		}
	}
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function seed() {
	const start = Date.now();
	await cleanSeedUsers(COUNT);
	const userIds = await seedUsers(COUNT);
	await seedFollows(userIds);

	// await seedPosts(userIds);

	const elapsed = ((Date.now() - start) / 1000).toFixed(1);
	console.log(
		`done in ${elapsed}s  |  email: seed1@test.com ... seed${COUNT}@test.com  |  password: ${PASSWORD}`
	);
	process.exit(0);
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});

// Helpers

const s3 = new S3Client({
	endpoint: config.S3_ENDPOINT,
	region: "auto",
	credentials: {
		accessKeyId: config.R2_ACCESS_KEY_ID,
		secretAccessKey: config.R2_SECRET_ACCESS_KEY,
	},
	forcePathStyle: true, // required for MinIO
});

async function uploadSeedAvatar(i: number): Promise<string> {
	const len = PFP_RANGE.end - PFP_RANGE.start + 1;
	const fileIndex = PFP_RANGE.start + ((i - 1) % len);

	// Local file sitting in your repo
	const localPath = path.resolve(`./public/static/temp/pfp/${fileIndex}.jpg`);
	const fileBuffer = fs.readFileSync(localPath);

	// Store under a stable seed key so re-runs don't duplicate
	const key = `avatars/seed/pfp-${fileIndex}.jpg`;

	await s3.send(
		new PutObjectCommand({
			Bucket: config.R2_BUCKET_NAME,
			Key: key,
			Body: fileBuffer,
			ContentType: "image/jpeg",
		})
	);

	return key; // this is what goes into avatarKey
}
