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
		.input(profileSchema.get.input)
		.output(profileSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.get({ ...input });
		}),

	isUsernameAvailable: profileProcedure
		.input(profileSchema.isUsernameAvailable.input)
		.output(profileSchema.isUsernameAvailable.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.isUsernameAvailable({ ...input });
		}),

	update: profileProcedure
		.input(profileSchema.update.input)
		.output(profileSchema.update.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.update({ ...input });
		}),

	getAvatarPresignedUrl: profileProcedure
		.input(profileSchema.getAvatarPresignedUrl.input)
		.output(profileSchema.getAvatarPresignedUrl.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.getAvatarPresignedUrl({ ...input });
		}),

	getBannerPresignedUrl: profileProcedure
		.input(profileSchema.getBannerPresignedUrl.input)
		.output(profileSchema.getBannerPresignedUrl.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.getBannerPresignedUrl({ ...input });
		}),

	updateAvatar: profileProcedure
		.input(profileSchema.updateAvatar.input)
		.output(profileSchema.updateAvatar.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.updateAvatar({ ...input });
		}),

	updateBanner: profileProcedure
		.input(profileSchema.updateBanner.input)
		.output(profileSchema.updateBanner.output)
		.handler(async ({ input, context }) => {
			return await context.profileService.updateBanner({ ...input });
		}),
});
