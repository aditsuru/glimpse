import * as z from "zod";
import { PostOutputSchema } from "@/server/shared/schemas/post";

const NextCursor = z.object({
	source: z.enum(["db", "redis"]),
	cursor: z.date(),
});

export const feedSchema = {
	get: {
		input: z.object({
			nextCursor: NextCursor,
		}),
		output: z.object({
			items: z.array(PostOutputSchema),
			nextCursor: NextCursor,
		}),
	},
};
