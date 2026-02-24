import * as z from "zod";
import { protectedProcedure } from "@/server/os";

export const postsRouter = {
	list: protectedProcedure
		.input(z.object({}))
		.output(z.object({}))
		.handler(() => {
			return {};
		}),
	get: protectedProcedure
		.input(z.object({}))
		.output(z.object({}))
		.handler(() => {
			return {};
		}),
	create: protectedProcedure
		.input(z.object({}))
		.output(z.object({}))
		.handler(() => {
			return {};
		}),
	delete: protectedProcedure
		.input(z.object({}))
		.output(z.object({}))
		.handler(() => {
			return {};
		}),
	update: protectedProcedure
		.input(z.object({}))
		.output(z.object({}))
		.handler(() => {
			return {};
		}),
};
