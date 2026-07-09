import { adminProcedure, base } from "@/server/os";
import { banSchema } from "./ban.schema";
import { BanService } from "./ban.service";

const banProcedure = adminProcedure.use(({ context, next }) => {
	const banService = new BanService(context.db, context.session.user.id);
	return next({ context: { banService } });
});

export const banRouter = base.router({
	create: banProcedure
		.input(banSchema.create.input)
		.output(banSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.banService.create({ ...input });
		}),
});
