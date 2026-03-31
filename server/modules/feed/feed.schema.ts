import * as z from "zod";
import { PostOutputSchema } from "@/server/shared/schemas/post";

const NextCursor = z.object({
	source: z.enum(["db", "redis"]),
	cursor: z.union([z.date(), z.string()]).nullable(),
});

export const feedSchema = {
	get: {
		input: z
			.object({
				nextCursor: NextCursor,
			})
			.partial(),
		output: z.object({
			items: z.array(PostOutputSchema),
			nextCursor: NextCursor,
		}),
	},
};
