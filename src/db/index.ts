import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { config } from "@/lib/shared/config";
import * as schema from "./schema";

function createDb() {
	if (config.NODE_ENV === "development") {
		return drizzleNode({
			connection: config.DATABASE_URL,
			schema,
		});
	}

	const sql = neon(config.DATABASE_URL);
	return drizzleNeon({ client: sql, schema });
}

export const db = createDb();
