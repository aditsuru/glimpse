import { authedProcedure, base } from "@/server/os";
import { notificationSchema } from "./notification.schema";
import { NotificationService } from "./notification.service";

const notificationProcedure = authedProcedure.use(({ context, next }) => {
	const notificationService = new NotificationService(
		context.db,
		context.session.user.id
	);
	return next({ context: { notificationService } });
});

export const notificationRouter = base.router({
	getAll: notificationProcedure
		.input(notificationSchema.getAll.input)
		.output(notificationSchema.getAll.output)
		.handler(async ({ input, context }) => {
			return await context.notificationService.getAll({ ...input });
		}),

	markSeen: notificationProcedure
		.input(notificationSchema.markSeen.input)
		.output(notificationSchema.markSeen.output)
		.handler(async ({ input, context }) => {
			return await context.notificationService.markSeen({ ...input });
		}),

	getUnreadCount: notificationProcedure
		.output(notificationSchema.getUnreadCount.output)
		.handler(async ({ context }) => {
			return await context.notificationService.getUnreadCount();
		}),
});
