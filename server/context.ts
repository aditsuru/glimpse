import { headers } from "next/headers";
import { db } from "@/drizzle/db";
import { auth } from "@/lib/auth";

export async function createContext() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return {
		db,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
