import { config } from "@/lib/config";
import { REDIS_KEYS } from "@/lib/constants";
import { redis } from "@/lib/redis";

export async function markPostAsSeen(userId: string, postId: string) {
	const seenKey = REDIS_KEYS.POST_SEEN(userId);
	const viewsCountKey = REDIS_KEYS.VIEWS_COUNT(postId);
	const syncPendingViewsKey = REDIS_KEYS.SYNC_PENDING_VIEWS_LIST();

	const [isAdded] = await redis
		.pipeline()
		.zadd(seenKey, { nx: true }, { score: Date.now(), member: postId })
		.zremrangebyrank(seenKey, 0, -(config.REDIS_FEED_SEEN_MAX_ITEMS + 1))
		.exec();

	if (isAdded === 1) {
		await redis
			.pipeline()
			.incr(viewsCountKey)
			.sadd(syncPendingViewsKey, postId)
			.exec();
	}
}

export async function getSeenPostIds(userId: string) {
	const key = REDIS_KEYS.POST_SEEN(userId);

	return await redis.zrange<string[]>(
		key,
		0,
		config.REDIS_FEED_SEEN_MAX_ITEMS - 1
	);
}
