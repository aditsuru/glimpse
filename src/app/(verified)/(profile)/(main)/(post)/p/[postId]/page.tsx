import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { cache } from "react";
import { db } from "@/db";
import { attachmentsTable } from "@/db/schema/attachments";
import { postsTable } from "@/db/schema/posts";
import { profilesTable } from "@/db/schema/profiles";
import { orpc } from "@/lib/client/orpc-client";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { buildMetadata, truncate } from "@/lib/shared/metadata";
import { PostPage } from "./PostPage";

const getPostForMetadata = cache(async (postId: string) => {
	const post = await db
		.select({
			id: postsTable.id,
			body: postsTable.body,
			spoiler: postsTable.spoiler,
			createdAt: postsTable.createdAt,
			authorDisplayName: profilesTable.displayName,
			authorUsername: profilesTable.username,
			authorVisibility: profilesTable.visibility,
		})
		.from(postsTable)
		.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
		.where(eq(postsTable.id, postId))
		.limit(1)
		.then((r) => r[0]);

	if (!post) return null;

	const firstAttachment = await db
		.select({ mimeType: attachmentsTable.mimeType })
		.from(attachmentsTable)
		.where(eq(attachmentsTable.postId, postId))
		.orderBy(attachmentsTable.position)
		.limit(1)
		.then((r) => r[0] ?? null);

	return { ...post, hasAttachment: !!firstAttachment };
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ postId: string }>;
}): Promise<Metadata> {
	const { postId } = await params;
	const post = await getPostForMetadata(postId);

	if (!post) {
		return buildMetadata({ title: "Post Not Found", noindex: true });
	}

	if (post.authorVisibility === "private") {
		return buildMetadata({
			title: "This post is from a private account",
			noindex: true,
		});
	}

	if (post.spoiler) {
		const title = `${post.authorDisplayName} on Glimpse`;
		return {
			title,
			description: "View this post on Glimpse.",
			alternates: { canonical: `/p/${postId}` },
			openGraph: { title, type: "article", url: `/p/${postId}` },
			twitter: { card: "summary_large_image", title },
		};
	}

	const title = post.body
		? `${post.authorDisplayName} on Glimpse: "${truncate(post.body, 60)}"`
		: `${post.authorDisplayName} on Glimpse`;

	const description = post.body
		? truncate(post.body, 155)
		: post.hasAttachment
			? "View this post on Glimpse."
			: "View this post on Glimpse.";

	return {
		title,
		description,
		alternates: { canonical: `/p/${postId}` },
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime: post.createdAt.toISOString(),
			url: `/p/${postId}`,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

export default async function Page({
	params,
}: {
	params: Promise<{ postId: string }>;
}) {
	const { postId } = await params;

	const post = await getPostForMetadata(postId);

	const queryClient = new QueryClient();
	await queryClient.prefetchQuery(
		orpc.post.get.queryOptions({ input: { postId } })
	);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{post && post.authorVisibility !== "private" && !post.spoiler && (
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SocialMediaPosting",
							headline: post.body
								? truncate(post.body, 110)
								: `Post by ${post.authorDisplayName}`,
							text: post.body ?? undefined,
							datePublished: post.createdAt.toISOString(),
							author: {
								"@type": "Person",
								name: post.authorDisplayName,
								url: `https://glimpse.aditsuru.com/${post.authorUsername}`,
							},
						}),
					}}
				/>
			)}
			<PostPage postId={postId} />
		</HydrationBoundary>
	);
}
