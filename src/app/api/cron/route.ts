/** biome-ignore-all lint/suspicious/noExplicitAny: none */
/** biome-ignore-all lint/style/noNonNullAssertion: none */

import { serve } from "@upstash/workflow/nextjs";
import { inArray, type SQL, sql } from "drizzle-orm";
import { db } from "@/db";
import { postsTable, viewHistoryTable } from "@/db/schema";
import { logger } from "@/lib/server/logger";
import { REDIS_KEYS, redis } from "@/lib/server/redis";

export const { POST } = serve(async (context) => {
	const userIds = await context.run("scan-redis-keys", async () => {
		const prefix = REDIS_KEYS.FROM_KEY("post:history:");
		const ids: string[] = [];
		let cursor = 0;
		do {
			const [next, keys] = await redis.scan(cursor, {
				match: `${prefix}*`,
				count: 200,
			});
			cursor = Number(next);
			keys
				.filter((k: string) => !k.endsWith(":flushing"))
				.forEach((k: string) => {
					ids.push(k.split(":").pop()!);
				});
		} while (cursor !== 0);
		return ids;
	});

	if (userIds.length === 0) return;

	const flushData = await context.run("acquire-flushes", async () => {
		const results = await Promise.all(
			userIds.map(async (userId) => {
				const src = REDIS_KEYS.VIEW_HISTORY(userId);
				const dst = REDIS_KEYS.VIEW_HISTORY_FLUSHING(userId);

				try {
					await redis.rename(src, dst);
				} catch (e: any) {
					if (e.message?.includes("no such key")) return null;
					throw e;
				}

				const postIds = await redis.zrange<string[]>(dst, 0, -1);
				return postIds.length ? { userId, postIds } : null;
			})
		);
		return results.filter(Boolean) as { userId: string; postIds: string[] }[];
	});

	if (flushData.length === 0) return;

	const allPostIds = [...new Set(flushData.flatMap((d) => d.postIds))];

	await context.run("write-view-history", async () => {
		const validPosts = await db
			.select({ id: postsTable.id })
			.from(postsTable)
			.where(inArray(postsTable.id, allPostIds));

		const validPostIds = new Set(validPosts.map((p) => p.id));

		const insertions = flushData.flatMap(({ userId, postIds }) =>
			postIds
				.filter((postId) => validPostIds.has(postId))
				.map((postId) => ({ userId, postId }))
		);

		if (insertions.length === 0) return;

		await db
			.insert(viewHistoryTable)
			.values(insertions)
			.onConflictDoNothing({
				target: [viewHistoryTable.userId, viewHistoryTable.postId],
			});
	});

	await context.run("write-view-counts", async () => {
		const pipeline = redis.pipeline();
		allPostIds.forEach((id) => {
			pipeline.getdel(REDIS_KEYS.POST_VIEWS(id));
		});
		const raw = await pipeline.exec<(number | null)[]>();

		const deltas = allPostIds
			.map((id, i) => ({ id, delta: raw[i] ?? 0 }))
			.filter((e) => e.delta > 0);

		if (deltas.length === 0) return;

		const chunks: SQL[] = [sql`(case`];
		const ids: string[] = [];
		for (const { id, delta } of deltas) {
			chunks.push(sql`when ${postsTable.id} = ${id} then ${delta}`);
			ids.push(id);
		}
		chunks.push(sql`end)`);
		const caseExpr = sql.join(chunks, sql.raw(" "));

		await db
			.update(postsTable)
			.set({ views: sql`${postsTable.views} + ${caseExpr}` })
			.where(inArray(postsTable.id, ids));
	});

	await context.run("release-flushes", async () => {
		await Promise.all(
			flushData.map(({ userId }) =>
				redis.del(REDIS_KEYS.VIEW_HISTORY_FLUSHING(userId))
			)
		);
	});

	logger.info(`Cron synced ${allPostIds.length} views and updated histories.`);
});
