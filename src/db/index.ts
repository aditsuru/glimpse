import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
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

	const pool = new Pool({ connectionString: config.DATABASE_URL });
	return drizzleNeon({ client: pool, schema });
}

export const db = createDb();
