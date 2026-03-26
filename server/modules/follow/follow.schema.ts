import * as z from "zod";

export const followSchema = {
    get: {
        input: z.object({
            followId: z.string(),
        }),
        output: z.object({})
    }
}