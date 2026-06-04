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

const WEIGHTS = {
	view: 0.5,
	like: 2.0,
	comment: 4.0,
} as const;

export async function incrementTrendingScore(
	postId: string,
	event: keyof typeof WEIGHTS
) {
	await redis.zincrby(REDIS_KEYS.TRENDING_FEED(), WEIGHTS[event], postId);
}

export async function removeTrendingPost(postId: string) {
	await redis.zrem(REDIS_KEYS.TRENDING_FEED(), postId);
}

export async function getTrendingPage(
	cursor: number | null,
	limit: number,
	seenPostIds: Set<string>
): Promise<{ postIds: string[]; nextCursor: number | null }> {
	const maxScore: number | "+inf" = cursor !== null ? cursor : "+inf";

	const results = (await redis.zrange(
		REDIS_KEYS.TRENDING_FEED(),
		maxScore,
		"-inf",
		{
			byScore: true,
			rev: true,
			withScores: true,
			offset: 0,
			count: limit * 3,
		}
	)) as string[];

	if (results.length === 0) return { postIds: [], nextCursor: null };

	const pairs: { id: string; score: number }[] = [];
	for (let i = 0; i < results.length; i += 2) {
		pairs.push({ id: results[i], score: Number(results[i + 1]) });
	}

	const unseen = pairs.filter((p) => !seenPostIds.has(p.id));
	const seen = pairs.filter((p) => seenPostIds.has(p.id));
	const ordered = [...unseen, ...seen].slice(0, limit + 1);

	const hasNext = ordered.length > limit;
	const trimmed = hasNext ? ordered.slice(0, limit) : ordered;
	// biome-ignore lint/style/noNonNullAssertion: none
	const nextCursor = hasNext ? trimmed.at(-1)!.score : null;

	return {
		postIds: trimmed.map((p) => p.id),
		nextCursor,
	};
}
