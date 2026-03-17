import { authedProcedure, base } from "@/server/os";
import { uploadSchema } from "./upload.schema";
import { UploadService } from "./upload.service";

const uploadProcedure = authedProcedure.use(({ next }) => {
	const uploadService = new UploadService();
	return next({
		context: {
			uploadService,
		},
	});
});

export const uploadRouter = base.router({
	getPresignedUrl: uploadProcedure
		.input(uploadSchema.getPresignedUrl.input)
		.output(uploadSchema.getPresignedUrl.output)
		.handler(async ({ input, context }) => {
			return await context.uploadService.getPresignedUrl({ ...input });
		}),
});
