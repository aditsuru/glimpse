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
	update: profileProcedure
		.input(profileSchema.update.input)
		.output(profileSchema.update.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.update({
				...input,
				userId: context.session.user.id,
			});
		}),
});
