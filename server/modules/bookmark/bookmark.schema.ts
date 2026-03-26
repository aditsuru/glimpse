import * as z from "zod";

import { PostOutputSchema } from "../post/post.schema";

export const bookmarkSchema = {
	profile: {
		getBookmarksHistory: {
			input: z.object({
				nextCursor: z.date().optional(),
			}),
			output: z.object({
				items: z.array(PostOutputSchema),
				nextCursor: z.date().nullable(),
			}),
		},
	},
};
