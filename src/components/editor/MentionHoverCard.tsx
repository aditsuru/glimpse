"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MentionHoverCardProps, MentionUser } from "@/primitives/editor/types";

/*
 * WHY onMouseEnter and NOT onOpenChange:
 *
 * shadcn's Base UI HoverCard does NOT have an onOpenChange prop on the root.
 * The Base UI API is:
 *
 *   <HoverCard>
 *     <HoverCardTrigger delay={300} closeDelay={100}>trigger</HoverCardTrigger>
 *     <HoverCardContent side="top" align="start">content</HoverCardContent>
 *   </HoverCard>
 *
 * There is no lifecycle callback to hook into open/close events from the root.
 * Solution: fire the fetch on onMouseEnter of the trigger element — the user
 * has to hover before the card opens anyway (delay=300ms), so by the time the
 * popup appears the fetch is already in flight or done.
 */

type LoadState = "idle" | "loading" | "done";

export function MentionHoverCard({ id, label, fetchUser }: MentionHoverCardProps) {
	const [user, setUser] = useState<MentionUser | null>(null);
	const loadStateRef = useRef<LoadState>("idle");

	// Guard: literal "undefined" can leak from legacy stored content
	const safeLabel = label && label !== "undefined" ? label : id;

	const handleMouseEnter = () => {
		// Only fetch once, only if a loader was provided
		if (loadStateRef.current !== "idle" || !fetchUser) return;
		loadStateRef.current = "loading";
		fetchUser(id)
			.then((data) => {
				setUser(data);
				loadStateRef.current = "done";
			})
			.catch(() => {
				loadStateRef.current = "done";
			});
	};

	const displayName = user?.displayName ?? safeLabel;
	const username = user?.username ?? safeLabel;
	const initial = displayName[0]?.toUpperCase() ?? "?";
	const isLoading = !user && loadStateRef.current === "loading";

	return (
		<HoverCard>
			{/*
			 * Base UI HoverCard uses the `render` prop (not `asChild`) to replace
			 * the host element. This forwards all trigger event handlers onto our
			 * <a> so ONE element exists in the DOM.
			 *
			 * delay: 300ms before opening — gives the fetch time to start.
			 * closeDelay: 150ms before closing — prevents flicker when cursor
			 *             moves from trigger to card content.
			 */}
			<HoverCardTrigger
				delay={300}
				closeDelay={150}
				render={
					<a
						href={`/u/${id}`}
						className="tiptap-mention"
						data-mention-id={id}
						data-mention-label={safeLabel}
						onMouseEnter={handleMouseEnter}
						onClick={(e) => e.preventDefault()}
					>
						@{safeLabel}
					</a>
				}
			/>

			<HoverCardContent side="top" align="start" className="w-64 p-3">
				{isLoading ? (
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
