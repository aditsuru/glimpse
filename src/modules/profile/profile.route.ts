import { authedProcedure, base } from "@/server/os";
import { profileSchema } from "./profile.schema";
import { ProfileService } from "./profile.service";

const profileProcedure = authedProcedure.use(({ context, next }) => {
	const profileService = new ProfileService(
		context.db,
		context.session.user.id
	);
	return next({
		context: {
			profileService,
		},
	});
});

export const profileRouter = base.router({
	get: profileProcedure
		.output(profileSchema.get.output)
		.handler(async ({ context }) => {
			return await context.profileService.get();
		}),
});
