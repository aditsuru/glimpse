import type { db as DBType } from "@/db";

export class FollowService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}
}
