import type { db } from "@/drizzle/db";
import type { auth } from "@/lib/auth";

export type AppContext = {
	db: typeof db;
	session: typeof auth.$Infer.Session | null;
};
