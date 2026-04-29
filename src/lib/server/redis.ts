import { Redis } from "@upstash/redis";
import { config } from "@/lib/shared/config";

export const redis = new Redis({
	url: config.UPSTASH_REDIS_REST_URL,
	token: config.UPSTASH_REDIS_REST_TOKEN,
});

export const REDIS_KEYS = {
	FROM_KEY: (key: string) => `${config.NODE_ENV}:${key}`,
	POST_SEEN: (userId: string) => `${config.NODE_ENV}:post:seen:${userId}`,
	VIEWS_COUNT: (postId: string) => `${config.NODE_ENV}:post:views:${postId}`,
	SYNC_PENDING_VIEWS_LIST: () => `${config.NODE_ENV}:sync:pending:views`,
	RATE_LIMIT: (ip: string) => `${config.NODE_ENV}:ratelimit:auth:${ip}`,
};
