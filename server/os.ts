import { ORPCError, os } from "@orpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { config } from "@/lib/config";
import { REDIS_KEYS } from "@/lib/constants";
import { redis } from "@/lib/redis";
import type { Context } from "./context";

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.slidingWindow(
		config.RATE_LIMIT_MAX,
		`${config.RATE_LIMIT_WINDOW} s`
	),
});

export const base = os.$context<Context>().use(async ({ context, next }) => {
	const { success } = await ratelimit.limit(REDIS_KEYS.RATE_LIMIT(context.ip));

	if (!success) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: "Rate limit exceeded. Please try again later.",
		});
	}

	return next({ context });
});

export const publicProcedure = base;

export const authedProcedure = base.use(({ context, next }) => {
	if (!context.session) {
		throw new ORPCError("UNAUTHORIZED");
	}
	return next({
		context: {
			...context,
			session: context.session,
		},
	});
});
