import { serve } from "@upstash/workflow/nextjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { postsTable } from "@/drizzle/schema";
import { REDIS_KEYS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { redis } from "@/lib/redis";

export const { POST } = serve(async (context) => {
	// Step 1: Get the list of post ids from Redis
	const postIds = await context.run("get-dirty-list", async () => {
		return await redis.smembers(REDIS_KEYS.SYNC_PENDING_VIEWS_LIST());
	});

	if (postIds.length === 0) return;

	// Step 2: Fetch the actual counts
	const counts = await context.run("get-counts", async () => {
		const postViewCountKeys = postIds.map((id) => REDIS_KEYS.VIEWS_COUNT(id));
		return await redis.mget<number[]>(...postViewCountKeys);
	});

	// Step 3: Update the Database
	await context.run("update-drizzle", async () => {
		const syncPromises = postIds.map((id, index) => {
			const count = counts[index];

			if (!count || count <= 0) return Promise.resolve();

			return db
				.update(postsTable)
				.set({
					views: sql`${postsTable.views} + ${count}`,
				})
				.where(eq(postsTable.id, id));
		});

		await Promise.all(syncPromises);
	});

	// Step 4: Cleanup Redis
	await context.run("cleanup-redis", async () => {
		const postViewCountKeys = postIds.map((id) => REDIS_KEYS.VIEWS_COUNT(id));
		await Promise.all([
			redis.srem(REDIS_KEYS.SYNC_PENDING_VIEWS_LIST(), ...postIds),
			redis.del(...postViewCountKeys),
		]);
	});
	logger.info("Cron job successfully updated views count from Redis.");
});
