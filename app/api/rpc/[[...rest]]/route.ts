import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { db } from "@/drizzle/db";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { AppContext } from "@/server/context";
import { router } from "@/server/router";

const handler = new RPCHandler(router, {
	interceptors: [
		onError((error: unknown) => {
			logger.error({ err: error }, "[oRPC Error] Uncaught procedure failure");
		}),
	],
});

async function handleRequest(req: Request): Promise<Response> {
	const session = await auth.api.getSession({ headers: req.headers });

	const context: AppContext = {
		db,
		session,
	};

	const { response } = await handler.handle(req, {
		prefix: "/rpc",
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
