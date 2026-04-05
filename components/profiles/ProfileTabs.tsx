"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = [
	{ value: "posts", label: "Posts" },
	{ value: "likes", label: "Likes" },
	{ value: "bookmarks", label: "Bookmarks" },
	{ value: "comments", label: "Comments" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export function ProfileTabs() {
	const [active, setActive] = useState<TabValue>("posts");

	return (
		<Tabs
			value={active}
			onValueChange={(v) => setActive(v as TabValue)}
			className="w-full"
		>
			<TabsList variant="line" className="w-full grid grid-cols-4">
				{TABS.map(({ value, label }) => (
					<TabsTrigger
						key={value}
						value={value}
						className="after:bg-primary! data-active:font-semibold data-active:text-foreground text-bold text-md"
					>
						{label}
					</TabsTrigger>
				))}
			</TabsList>

			{TABS.map(({ value }) => (
				<TabsContent key={value} value={value} className="mt-0 pt-4">
					{/* content goes here */}
				</TabsContent>
			))}
		</Tabs>
	);
}
