import { authedProcedure, base } from "@/server/os";
import { reportSchema } from "./report.schema";
import { ReportService } from "./report.service";

const reportProcedure = authedProcedure.use(({ context, next }) => {
	const reportService = new ReportService(context.db, context.session.user.id);
	return next({ context: { reportService } });
});

export const reportRouter = base.router({
	create: reportProcedure
		.input(reportSchema.create.input)
		.output(reportSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.reportService.create({ ...input });
		}),
});
