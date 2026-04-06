import "server-only";

import { Redis } from "@upstash/redis";
import { config } from "@/lib/shared/config";

export const redis = new Redis({
	url: config.UPSTASH_REDIS_REST_URL,
	token: config.UPSTASH_REDIS_REST_TOKEN,
});
