import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import type { feedSchema } from "./feed.schema";

export class FeedService {
	constructor(private db: typeof DBType) {}

	async get({
		userId,
	}: z.infer<typeof feedSchema.get.input> & {
		userId: string;
	}): Promise<z.infer<typeof feedSchema.get.output>> {
		// Implementation
		return {}
    }
}