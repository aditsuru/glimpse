import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";
import { config } from "@/lib/config";

const sql = neon(config.DATABASE_URL);
export const db = drizzle({ client: sql, schema });
