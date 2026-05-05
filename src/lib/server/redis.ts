// DO NOT: import "server-only";

import { Redis } from "@upstash/redis";
import { config } from "@/lib/shared/config";

export const redis = new Redis({
	url: config.UPSTASH_REDIS_REST_URL,
	token: config.UPSTASH_REDIS_REST_TOKEN,
});

export const REDIS_KEYS = {
	FROM_KEY: (key: string) => `${config.NODE_ENV}:${key}`,
	RATE_LIMIT: (ip: string) => `${config.NODE_ENV}:ratelimit:auth:${ip}`,
	POST_VIEWS: (postId: string) => `${config.NODE_ENV}:post:views:${postId}`,
	VIEW_HISTORY: (userId: string) => `${config.NODE_ENV}:post:history:${userId}`,
	VIEW_HISTORY_FLUSHING: (userId: string) =>
		`${config.NODE_ENV}:post:history:${userId}:flushing`,
};
