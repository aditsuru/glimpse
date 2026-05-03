import { db } from "@/db";
import { profilesTable } from "@/db/schema";
import { user } from "@/db/schema/auth-schema";

// Helper function for the delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function seed() {
	for (let i = 21; i < 40; i++) {
		// 1. Prepare User Data
		const userData = {
			id: `seed-user-${i}`,
			name: `Test User ${i}`,
			email: `testuser${i}@seed.com`,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// 2. Prepare Profile Data
		const profileData = {
			userId: `seed-user-${i}`,
			username: `testuser${i}`,
			displayName: `Test User ${i}`,
			bio: `This is test user ${i}'s bio`,
			pronouns: i % 2 === 0 ? "he/him" : "she/her",
		};

		// 3. Insert both into the database
		await db.insert(user).values(userData).onConflictDoNothing();
		await db.insert(profilesTable).values(profileData).onConflictDoNothing();

		console.log(`Seeded user + profile ${i + 1} of 20`);

		if (i < 19) {
			await delay(1000);
		}
	}

	console.log("Seeding complete. Hope you enjoyed the wait!");
	process.exit(0);
}

seed();
