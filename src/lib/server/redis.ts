import { Redis } from "@upstash/redis";
import { config } from "@/lib/shared/config";

export const redis = new Redis({
	url: config.UPSTASH_REDIS_REST_URL,
	token: config.UPSTASH_REDIS_REST_TOKEN,
});

export const REDIS_KEYS = {
	POST_SEEN: (userId: string) => `${config.REDIS_PREFIX}:post:seen:${userId}`,
	VIEWS_COUNT: (postId: string) =>
		`${config.REDIS_PREFIX}:post:views:${postId}`,
	SYNC_PENDING_VIEWS_LIST: () => `${config.REDIS_PREFIX}:sync:pending:views`,
	RATE_LIMIT: (ip: string) => `${config.REDIS_PREFIX}:ratelimit:auth:${ip}`,
};
