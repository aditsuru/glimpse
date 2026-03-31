import "server-only";
import { createRouterClient } from "@orpc/server";
import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { auth } from "@/lib/auth";
import { router } from "@/server/router";

export async function getServerCaller() {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });
	const ip =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"127.0.0.1";

	return createRouterClient(router, {
		context: { db, session, ip },
	});
}
