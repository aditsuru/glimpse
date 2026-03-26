import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import type { followSchema } from "./follow.schema";

export class FollowService {
	constructor(private db: typeof DBType) {}

	async get({
		userId,
	}: z.infer<typeof followSchema.get.input> & {
		userId: string;
	}): Promise<z.infer<typeof followSchema.get.output>> {
		// Implementation
		return {}
    }
}