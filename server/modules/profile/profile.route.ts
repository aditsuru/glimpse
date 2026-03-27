import { authedProcedure, base } from "@/server/os";
import { profileSchema } from "./profile.schema";
import { ProfileService } from "./profile.service";

const profileProcedure = authedProcedure.use(({ context, next }) => {
	const profileService = new ProfileService(context.db);
	return next({
		context: {
			profileService,
		},
	});
});

export const profileRouter = base.router({
	get: profileProcedure
		.input(profileSchema.get.input)
		.output(profileSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.get({
				...input,
			});
		}),
	update: profileProcedure
		.input(profileSchema.update.input)
		.output(profileSchema.update.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.update({
				...input,
				userId: context.session.user.id,
			});
		}),
	searchUsers: profileProcedure
		.input(profileSchema.searchUsers.input)
		.output(profileSchema.searchUsers.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.searchUsers({
				...input,
			});
		}),
});
