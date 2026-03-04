import "server-only";
import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { auth } from "@/lib/auth";
import { router } from "@/server/router";

export async function getServerCaller() {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	return createRouterClient(router, {
		context: { db, session },
	});

	// Object literal may only specify known properties, and 'db' does not exist in type 'Value<PromiseLike<never>, [clientContext: ClientContext]>'.
}
