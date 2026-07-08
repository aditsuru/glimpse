import { adminProcedure, authedProcedure, base } from "@/server/os";
import { reportSchema } from "./report.schema";
import { ReportService } from "./report.service";

const reportProcedure = authedProcedure.use(({ context, next }) => {
	const reportService = new ReportService(context.db, context.session.user.id);
	return next({ context: { reportService } });
});

const adminReportProcedure = adminProcedure.use(({ context, next }) => {
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

	getAll: adminReportProcedure
		.input(reportSchema.getAll.input)
		.output(reportSchema.getAll.output)
		.handler(async ({ input, context }) => {
			return await context.reportService.getAll({ ...input });
		}),

	resolve: adminReportProcedure
		.input(reportSchema.resolve.input)
		.output(reportSchema.resolve.output)
		.handler(async ({ input, context }) => {
			return await context.reportService.resolve({ ...input });
		}),

	deleteContent: adminReportProcedure
		.input(reportSchema.deleteContent.input)
		.output(reportSchema.deleteContent.output)
		.handler(async ({ input, context }) => {
			return await context.reportService.deleteContent({ ...input });
		}),
});
