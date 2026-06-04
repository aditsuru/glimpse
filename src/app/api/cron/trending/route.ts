import { serve } from "@upstash/workflow/nextjs";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	commentsTable,
	postLikesTable,
	postsTable,
	profilesTable,
} from "@/db/schema";
import { logger } from "@/lib/server/logger";
import { REDIS_KEYS, redis } from "@/lib/server/redis";

export const { POST } = serve(async (context) => {
	const scores = await context.run("compute-scores", async () => {
		return db
			.select({
				id: postsTable.id,
				score: sql<number>`(
          (
            1.0
            + ${postsTable.views} * 0.5
            + (SELECT count(*) FROM ${postLikesTable} WHERE ${postLikesTable.postId} = ${postsTable.id}) * 2
            + (SELECT count(*) FROM ${commentsTable}  WHERE ${commentsTable.postId}  = ${postsTable.id}) * 4
          ) / POWER(
            GREATEST(EXTRACT(EPOCH FROM (NOW() - ${postsTable.createdAt})) / 3600, 0) + 2,
            1.2
          )
        )`,
			})
			.from(postsTable)
			.innerJoin(
				profilesTable,
				and(
					eq(postsTable.userId, profilesTable.userId),
					eq(profilesTable.visibility, "public")
				)
			);
	});

	if (scores.length === 0) return;

	await context.run("write-trending-set", async () => {
		const key = REDIS_KEYS.TRENDING_FEED();
		const tmpKey = `${key}:rebuilding`;

		const pipeline = redis.pipeline();
		pipeline.del(tmpKey);
		for (const { id, score } of scores) {
			pipeline.zadd(tmpKey, { score, member: id });
		}
		pipeline.rename(tmpKey, key);
		pipeline.expire(key, 60 * 60 * 24);
		await pipeline.exec();
	});

	logger.info(`Trending feed rebuilt with ${scores.length} posts.`);
});
