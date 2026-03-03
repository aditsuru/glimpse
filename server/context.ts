import type { db } from "@/drizzle/db";
import type { auth } from "@/lib/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type AppContext = {
	db: typeof db;
	session: Session;
};
