import { desc, eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { db } from "@/db";
import { postsTable } from "@/db/schema/posts";
import { profilesTable } from "@/db/schema/profiles";

const BASE_URL = "https://glimpse.aditsuru.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: BASE_URL, changeFrequency: "hourly", priority: 1 },
		{ url: `${BASE_URL}/explore`, changeFrequency: "hourly", priority: 0.8 },
		{ url: `${BASE_URL}/sign-in`, changeFrequency: "yearly", priority: 0.3 },
		{ url: `${BASE_URL}/sign-up`, changeFrequency: "yearly", priority: 0.3 },
		{ url: `${BASE_URL}/legal/tos`, changeFrequency: "yearly", priority: 0.2 },
		{
			url: `${BASE_URL}/legal/privacy`,
			changeFrequency: "yearly",
			priority: 0.2,
		},
		{
			url: `${BASE_URL}/legal/guidelines`,
			changeFrequency: "yearly",
			priority: 0.2,
		},
	];

	const profiles = await db
		.select({
			username: profilesTable.username,
			updatedAt: profilesTable.updatedAt,
		})
		.from(profilesTable)
		.where(eq(profilesTable.visibility, "public"))
		.orderBy(desc(profilesTable.updatedAt))
		.limit(1000);

	const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
		url: `${BASE_URL}/${p.username}`,
		lastModified: p.updatedAt,
		changeFrequency: "daily",
		priority: 0.6,
	}));

	const posts = await db
		.select({
			id: postsTable.id,
			updatedAt: postsTable.updatedAt,
			authorVisibility: profilesTable.visibility,
		})
		.from(postsTable)
		.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
		.where(eq(profilesTable.visibility, "public"))
		.orderBy(desc(postsTable.createdAt))
		.limit(5000);

	const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
		url: `${BASE_URL}/p/${p.id}`,
		lastModified: p.updatedAt,
		changeFrequency: "weekly",
		priority: 0.5,
	}));

	return [...staticRoutes, ...profileRoutes, ...postRoutes];
}
