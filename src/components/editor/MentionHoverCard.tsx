"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
	MentionHoverCardProps,
	MentionUser,
} from "@/primitives/editor/types";

type LoadState = "idle" | "loading" | "done";

export function MentionHoverCard({
	id,
	label,
	fetchUser,
}: MentionHoverCardProps) {
	const [user, setUser] = useState<MentionUser | null>(null);
	const [loadState, setLoadState] = useState<LoadState>("idle");

	const handleOpenChange = async (open: boolean) => {
		// Only fetch once, only when opening, only when a fetcher is provided
		if (!open || loadState !== "idle" || !fetchUser) return;

		setLoadState("loading");
		try {
			const data = await fetchUser(id);
			setUser(data);
		} finally {
			setLoadState("done");
		}
	};

	const displayName = user?.displayName ?? label;
	const username = user?.username ?? label;
	const initial = displayName[0]?.toUpperCase() ?? "?";

	return (
		<HoverCard onOpenChange={handleOpenChange}>
			<HoverCardTrigger>
				{/* Rendered as a plain <a> so it works inside both RSC and client trees */}
				<a
					href={`/u/${id}`}
					className="tiptap-mention"
					data-mention-id={id}
					data-mention-label={label}
				>
					@{label}
				</a>
			</HoverCardTrigger>

			<HoverCardContent
				className="w-64 p-3"
				side="top"
				align="start"
				sideOffset={6}
			>
				{loadState === "loading" ? (
					/* Skeleton while fetching */
					<div className="flex items-center gap-3">
						<Skeleton className="h-10 w-10 rounded-full shrink-0" />
						<div className="flex flex-col gap-1.5 flex-1">
							<Skeleton className="h-3.5 w-24 rounded" />
							<Skeleton className="h-3 w-16 rounded" />
						</div>
					</div>
				) : (
					<div className="flex items-start gap-3">
						<Avatar className="h-10 w-10 shrink-0">
							<AvatarImage src={user?.avatarUrl} alt={displayName} />
							<AvatarFallback className="text-sm font-medium">
								{initial}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col min-w-0">
							<span className="font-semibold text-sm leading-snug truncate">
								{displayName}
							</span>
							<span className="text-xs text-muted-foreground truncate">
								@{username}
							</span>
						</div>
					</div>
				)}
			</HoverCardContent>
		</HoverCard>
	);
}
