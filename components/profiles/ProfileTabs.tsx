"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PostOutput } from "@/server/shared/schemas/post";
import { ScrollContainer } from "../layout/ScrollContainer";
import { PostCardCompact } from "../posts/PostCardCompact";

const TABS = [
	{ value: "posts", label: "Posts" },
	{ value: "likes", label: "Likes" },
	{ value: "bookmarks", label: "Bookmarks" },
	{ value: "comments", label: "Comments" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

interface ProfileTabsProps {
	posts: PostOutput[];
}

export function ProfileTabs({ posts }: ProfileTabsProps) {
	const [active, setActive] = useState<TabValue>("posts");

	return (
		<Tabs
			value={active}
			onValueChange={(v) => setActive(v as TabValue)}
			className="flex flex-col h-full overflow-hidden w-full gap-0 *:data-[slot=tabs-content]:w-full"
		>
			<TabsList
				variant="line"
				className="w-full grid grid-cols-4 shrink-0 border-b"
			>
				{TABS.map(({ value, label }) => (
					<TabsTrigger
						key={value}
						value={value}
						className="after:bg-primary! font-semibold data-active:font-bold data-active:text-foreground"
					>
						{label}
					</TabsTrigger>
				))}
			</TabsList>

			{TABS.map(({ value }) => (
				<TabsContent
					key={value}
					value={value}
					className="flex-1 w-full min-w-0 h-full"
				>
					<ScrollContainer className="h-full no-scrollbar">
						{value === "posts" && (
							<div className="flex flex-col divide-y divide-border w-full">
								{posts.map((post) => (
									<PostCardCompact key={post.id} {...post} />
								))}
							</div>
						)}
					</ScrollContainer>
				</TabsContent>
			))}
		</Tabs>
	);
}
