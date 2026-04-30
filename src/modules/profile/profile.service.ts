import type { db as DBType } from "@/db";

export class ProfileService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}
}
