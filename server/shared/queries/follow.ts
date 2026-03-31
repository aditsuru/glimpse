import { count, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { followersTable } from "@/drizzle/schema";

export async function getFollowingsCount({
	userId,
}: {
	userId: string;
}): Promise<{ count: number }> {
	const [{ count: followingsCount }] = await db
		.select({ count: count() })
		.from(followersTable)
		.where(eq(followersTable.followerId, userId));

	return { count: Number(followingsCount) };
}

export async function getFollowersCount({
	userId,
}: {
	userId: string;
}): Promise<{ count: number }> {
	const [{ count: followersCount }] = await db
		.select({ count: count() })
		.from(followersTable)
		.where(eq(followersTable.followingId, userId));

	return { count: Number(followersCount) };
}
