import { base } from "@/server/os";
import { dmcaSchema } from "./dmca.schema";
import { DmcaService } from "./dmca.service";

export const dmcaRouter = base.router({
	create: base
		.input(dmcaSchema.create.input)
		.output(dmcaSchema.create.output)
		.handler(async ({ input, context }) => {
			const service = new DmcaService(context.db);
			return await service.create(input);
		}),
});
