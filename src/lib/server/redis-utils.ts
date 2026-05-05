import { REDIS_KEYS, redis } from "./redis";

export async function markPostSeen(userId: string, postId: string) {
	await Promise.all([
		redis.zadd(
			REDIS_KEYS.VIEW_HISTORY(userId),
			{ nx: true },
			{ score: Date.now(), member: postId }
		),
		redis.incr(REDIS_KEYS.POST_VIEWS(postId)),
	]);
}

export async function getPostViews(postId: string) {
	return (await redis.get<number>(REDIS_KEYS.POST_VIEWS(postId))) ?? 0;
}

export async function getViewHistory(userId: string) {
	const [current, flushing] = await Promise.all([
		redis.zrange(REDIS_KEYS.VIEW_HISTORY(userId), 0, -1),
		redis.zrange(REDIS_KEYS.VIEW_HISTORY_FLUSHING(userId), 0, -1),
	]);
	return [...new Set([...current, ...flushing])];
}

export async function isPostSeen(userId: string, postId: string) {
	const [current, flushing] = await Promise.all([
		redis.zscore(REDIS_KEYS.VIEW_HISTORY(userId), postId),
		redis.zscore(REDIS_KEYS.VIEW_HISTORY_FLUSHING(userId), postId),
	]);
	return current !== null || flushing !== null;
}

export async function getPostViewsBatch(
	postIds: string[]
): Promise<Map<string, number>> {
	if (postIds.length === 0) return new Map();

	const pipeline = redis.pipeline();
	postIds.forEach((id) => {
		pipeline.get(REDIS_KEYS.POST_VIEWS(id));
	});
	const results = await pipeline.exec<(number | null)[]>();

	return new Map(postIds.map((id, i) => [id, results[i] ?? 0]));
}
