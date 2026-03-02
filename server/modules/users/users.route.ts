import { headers as getHeaders } from "next/headers";
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
	const headers = await getHeaders();
	return next({
		context: {
			userService,
			headers,
		},
	});
});

export const usersRouter = baseOs.router({
	updateProfile: usersProtectedProcedure
		.input(usersSchema.updateProfile.input)
		.output(usersSchema.updateProfile.output)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			return await context.userService.updateProfile({ userId, ...input });
		}),
	signOut: usersProtectedProcedure
		.output(usersSchema.signOut.output)
		.handler(async ({ context }) => {
			return await context.userService.signOut({ headers: await getHeaders() });
		}),
	signIn: usersPublicProcedure
		.input(usersSchema.signIn.input)
		.output(usersSchema.signIn.output)
		.handler(async ({ input, context }) => {
			return await context.userService.signIn({
				headers: context.headers,
				...input,
			});
		}),
	signUp: usersPublicProcedure
		.input(usersSchema.signUp.input)
		.output(usersSchema.signUp.output)
		.handler(async ({ input, context }) => {
			return await context.userService.signUp({
				headers: context.headers,
				...input,
			});
		}),
});
