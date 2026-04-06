import { headers } from "next/headers";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function createContext() {
	const reqHeaders = await headers();
	const session = await auth.api.getSession({
		headers: reqHeaders,
	});

	const ip =
		reqHeaders.get("x-forwarded-for")?.split(",")[0] ||
		reqHeaders.get("x-real-ip") ||
		"127.0.0.1";

	return {
		db,
		session,
		ip,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
