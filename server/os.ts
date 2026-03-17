import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const base = os.$context<Context>();

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
