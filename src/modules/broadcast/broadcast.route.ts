import { adminProcedure, base } from "@/server/os";
import { broadcastSchema } from "./broadcast.schema";
import { BroadcastService } from "./broadcast.service";

const broadcastProcedure = adminProcedure.use(({ context, next }) => {
	const broadcastService = new BroadcastService(context.db);
	return next({ context: { broadcastService } });
});

export const broadcastRouter = base.router({
	send: broadcastProcedure
		.input(broadcastSchema.send.input)
		.output(broadcastSchema.send.output)
		.handler(async ({ input, context }) => {
			return await context.broadcastService.send({ ...input });
		}),
});
