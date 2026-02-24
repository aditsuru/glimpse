import { ORPCError, os } from "@orpc/server";
import type { AppContext } from "./context";

export const publicProcedure = os.$context<AppContext>();

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
	if (!context.session?.user) throw new ORPCError("UNAUTHORIZED");
	return next({
		context: {
			...context,
			session: {
				session: context.session.session,
				user: context.session.user,
			},
		},
	});
});
