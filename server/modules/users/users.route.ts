import { baseOs, protectedProcedure, publicProcedure } from "@/server/os";
import { usersSchema } from "./users.schema";
import { UserService } from "./users.service";

const usersProtectedProcedure = protectedProcedure.use(({ context, next }) => {
	const userService = new UserService(context.db);
	return next({
		context: {
			userService,
		},
	});
});

const usersPublicProcedure = publicProcedure.use(async ({ context, next }) => {
	const userService = new UserService(context.db);
	return next({ context: { userService } });
});

export const usersRouter = baseOs.router({
	updateProfile: usersProtectedProcedure
		.input(usersSchema.updateProfile.input)
		.output(usersSchema.updateProfile.output)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			return await context.userService.updateProfile({ userId, ...input });
		}),
	checkAvailability: usersPublicProcedure
		.input(usersSchema.checkAvailability.input)
		.output(usersSchema.checkAvailability.output)
		.handler(async ({ input, context }) => {
			return await context.userService.checkAvailability(input);
		}),
});
