import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { user } from "@/drizzle/schema";
import { protectedProcedure } from "@/server/os";

export const usersRouter = {
	profile: protectedProcedure
		.input(
			z.object({
				bio: z.string().max(160).optional(),
				image: z.string().url().optional(),
				name: z.string().min(2).optional(),
			})
		)
		.output(
			z.object({
				success: z.boolean(),
			})
		)
		.handler(async ({ input, context }) => {
			try {
				const userId = context.session.user.id;
				context.db.update(user).set(input).where(eq(user.id, userId));
				return { success: true };
			} catch (e: unknown) {
				if (e instanceof ORPCError) throw e;

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fail to update post.",
					cause: e,
				});
			}
		}),
};
