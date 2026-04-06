import { serve } from "@upstash/workflow/nextjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { postsTable } from "@/db/schema";
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
		await db.transaction(async (tx) => {
			for (let i = 0; i < postIds.length; i++) {
				const count = counts[i];

				if (!count || count <= 0) continue;

				await tx
					.update(postsTable)
					.set({
						views: sql`${postsTable.views} + ${count}`,
					})
					.where(eq(postsTable.id, postIds[i]));
			}
		});
	});

	// Step 4: Cleanup Redis
	await context.run("cleanup-redis", async () => {
		const pipeline = redis.pipeline();

		pipeline.srem(REDIS_KEYS.SYNC_PENDING_VIEWS_LIST(), ...postIds);

		postIds.forEach((id, index) => {
			const count = counts[index];
			if (typeof count === "number" && count > 0) {
				pipeline.decrby(REDIS_KEYS.VIEWS_COUNT(id), count);
			}
		});

		await pipeline.exec();
	});

	logger.info("Cron job successfully updated views count from Redis.");
});
