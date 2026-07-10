import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";
import { PostLikedFeed } from "@/modules/post-like/components/PostLikedFeed";

export const metadata: Metadata = buildMetadata({
	title: "Likes",
	noindex: true,
});

export default function Page() {
	return <PostLikedFeed />;
}
