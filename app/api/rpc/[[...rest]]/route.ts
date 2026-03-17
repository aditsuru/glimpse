import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { APIError } from "better-auth";
import { db } from "@/drizzle/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { Context } from "@/server/context";
import { router } from "@/server/router";

const handler = new RPCHandler<Context>(router, {
	interceptors: [
		onError((error: unknown) => {
			if (error instanceof ORPCError) return;

			if (error instanceof APIError) {
				throw new ORPCError("BAD_REQUEST", {
					message:
						error.body?.message || error.message || "Authentication failed",
					cause: error,
				});
			}

			logger.error({ err: error }, "[oRPC Error] Uncaught procedure failure");

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Something went wrong. We are working on it.",
			});
		}),
	],
});

async function handleRequest(req: Request): Promise<Response> {
	const session = await auth.api.getSession({ headers: req.headers });

	const context: Context = {
		db,
		session,
	};

	const { response } = await handler.handle(req, {
		prefix: "/api/rpc",
		context,
	});

	return response ?? new Response("NOT_FOUND", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;
