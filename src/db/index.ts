import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { config } from "@/lib/shared/config";

const sql = neon(config.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
