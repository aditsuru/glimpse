// Recover lost views from view history table

import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { postsTable, viewHistoryTable } from "@/db/schema";

async function recoverViews() {
	const historyCounts = await db
		.select({
			postId: viewHistoryTable.postId,
			count: sql<number>`cast(count(*) as integer)`,
		})
		.from(viewHistoryTable)
		.groupBy(viewHistoryTable.postId);

	if (historyCounts.length === 0) {
		console.log("No history records found.");
		return;
	}

	const postIds = historyCounts.map((r) => r.postId);
	const currentCounts = await db
		.select({ id: postsTable.id, views: postsTable.views })
		.from(postsTable)
		.where(inArray(postsTable.id, postIds));

	const currentMap = new Map(currentCounts.map((r) => [r.id, r.views]));

	const toRestore = historyCounts.filter(({ postId, count }) => {
		const current = currentMap.get(postId) ?? 0;
		return count > current;
	});

	if (toRestore.length === 0) {
		console.log(
			"No posts need recovery — DB counts already >= history counts."
		);
		return;
	}

	console.log(`Restoring view counts for ${toRestore.length} posts...`);

	const CHUNK_SIZE = 100;
	for (let i = 0; i < toRestore.length; i += CHUNK_SIZE) {
		const chunk = toRestore.slice(i, i + CHUNK_SIZE);

		const ids = chunk.map((r) => r.postId);

		const caseExpr = sql`cast(case ${sql.join(
			chunk.map(
				({ postId, count }) =>
					sql`when ${postsTable.id} = ${postId} then ${count}`
			),
			sql` `
		)} end as integer)`;

		await db
			.update(postsTable)
			.set({ views: caseExpr })
			.where(inArray(postsTable.id, ids));

		console.log(
			`  Chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(toRestore.length / CHUNK_SIZE)} done`
		);
	}

	const totalRestored = toRestore.reduce((sum, r) => sum + r.count, 0);
	console.log(
		`Done. Restored ${totalRestored} total views across ${toRestore.length} posts.`
	);
}

recoverViews().catch(console.error);
