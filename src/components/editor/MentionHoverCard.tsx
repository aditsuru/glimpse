"use client";

import { useCallback, useRef, useState } from "react";
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

	// Use a ref for the load state so handleOpenChange's dependency array stays
	// stable. If we put `loadState` in the useCallback deps, every state transition
	// creates a new function reference, which causes HoverCard to re-attach its
	// event listener and can race with the open/close animation.
	const loadStateRef = useRef<LoadState>("idle");

	// Guard against the literal string "undefined" that appears when
	// options.suggestion.char was undefined during renderHTML (the root bug is
	// fixed in extensions.ts, but this is a second line of defence for any
	// already-persisted content in the DB).
	const safeLabel = label && label !== "undefined" ? label : id;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			// Only fetch on first open, and only if a fetcher was provided.
			if (!open || loadStateRef.current !== "idle" || !fetchUser) return;

			// Update both ref (for guard) and state (for re-render) synchronously.
			loadStateRef.current = "loading";
			setLoadState("loading");

			// Fire-and-forget: keep the handler synchronous so HoverCard doesn't
			// receive a Promise return value (it ignores it anyway, and async
			// handlers can cause subtle state ordering bugs with React batching).
			fetchUser(id)
				.then((data) => setUser(data))
				.catch(() => setUser(null))
				.finally(() => {
					loadStateRef.current = "done";
					setLoadState("done");
				});
		},
		[id, fetchUser] // ← loadState intentionally omitted; we use loadStateRef instead
	);

	const displayName = user?.displayName ?? safeLabel;
	const username = user?.username ?? safeLabel;
	const initial = displayName[0]?.toUpperCase() ?? "?";

	return (
		<HoverCard onOpenChange={handleOpenChange}>
			<HoverCardTrigger
				render={
					<a
						href={`/u/${id}`}
						className="tiptap-mention"
						data-mention-id={id}
						data-mention-label={safeLabel}
					>
						@{safeLabel}
					</a>
				}
			/>

			<HoverCardContent
				className="w-64 p-3"
				side="top"
				align="start"
				sideOffset={6}
			>
				{loadState === "loading" ? (
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
