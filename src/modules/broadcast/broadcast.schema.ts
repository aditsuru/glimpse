import * as z from "zod";

export const broadcastSchema = {
	send: {
		input: z.object({
			body: z.string().min(5, "Message too short.").max(500),
		}),
		output: z.object({ success: z.boolean(), count: z.number() }),
	},
};
