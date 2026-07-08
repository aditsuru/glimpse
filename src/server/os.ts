import { ORPCError, os } from "@orpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { eq } from "drizzle-orm";
import { bansTable } from "@/db/schema";
import { profilesTable } from "@/db/schema/profiles";
import { REDIS_KEYS, redis } from "@/lib/server/redis";
import { config } from "@/lib/shared/config";
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

export const authedProcedure = base.use(async ({ context, next }) => {
	if (!context.session) {
		throw new ORPCError("UNAUTHORIZED");
	}

	const ban = await context.db
		.select({
			id: bansTable.id,
			expiresAt: bansTable.expiresAt,
			isPermanent: bansTable.isPermanent,
		})
		.from(bansTable)
		.where(eq(bansTable.userId, context.session.user.id))
		.limit(1)
		.then((r) => r[0]);

	if (ban) {
		const isActive =
			ban.isPermanent || (ban.expiresAt && ban.expiresAt > new Date());
		if (isActive) {
			throw new ORPCError("FORBIDDEN", {
				message: "Your account has been suspended.",
				data: { reason: "banned" },
			});
		}
	}

	return next({
		context: {
			...context,
			session: context.session,
		},
	});
});

export const adminProcedure = authedProcedure.use(async ({ context, next }) => {
	const profile = await context.db
		.select({ role: profilesTable.role })
		.from(profilesTable)
		.where(eq(profilesTable.userId, context.session.user.id))
		.limit(1)
		.then((r) => r[0]);

	if (profile?.role !== "admin") {
		throw new ORPCError("FORBIDDEN", { message: "Admin access required." });
	}

	return next({ context });
});
