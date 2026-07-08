import { adminProcedure, base } from "@/server/os";
import { adminReportSchema } from "./admin-report.schema";
import { AdminReportService } from "./admin-report.service";

const adminReportProcedure = adminProcedure.use(({ context, next }) => {
	const adminReportService = new AdminReportService(context.db);
	return next({ context: { adminReportService } });
});

export const adminReportRouter = base.router({
	getReports: adminReportProcedure
		.input(adminReportSchema.getReports.input)
		.output(adminReportSchema.getReports.output)
		.handler(async ({ input, context }) => {
			return await context.adminReportService.getReports({ ...input });
		}),

	resolveReport: adminReportProcedure
		.input(adminReportSchema.resolveReport.input)
		.output(adminReportSchema.resolveReport.output)
		.handler(async ({ input, context }) => {
			return await context.adminReportService.resolveReport({ ...input });
		}),

	getDmcaRequests: adminReportProcedure
		.input(adminReportSchema.getDmcaRequests.input)
		.output(adminReportSchema.getDmcaRequests.output)
		.handler(async ({ input, context }) => {
			return await context.adminReportService.getDmcaRequests({ ...input });
		}),

	resolveDmcaRequest: adminReportProcedure
		.input(adminReportSchema.resolveDmcaRequest.input)
		.output(adminReportSchema.resolveDmcaRequest.output)
		.handler(async ({ input, context }) => {
			return await context.adminReportService.resolveDmcaRequest({ ...input });
		}),
});
