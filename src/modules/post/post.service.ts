import type { db as DBType } from "@/db"

export class PostService {
  constructor(
    private db: typeof DBType,
    private userId: string
  ) {}
}
