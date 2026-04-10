"use client";

import { useRef, useState } from "react";
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

export function MentionHoverCard({
	id,
	label,
	fetchUser,
}: MentionHoverCardProps) {
	const [user, setUser] = useState<MentionUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const hasFetched = useRef(false);

	const safeLabel = label && label !== "undefined" ? label : id;

	const handleOpenChange = (open: boolean) => {
		if (!open || hasFetched.current || !fetchUser) return;
		hasFetched.current = true;
		setIsLoading(true);
		fetchUser(id)
			.then((data) => setUser(data))
			.catch(() => {})
			.finally(() => setIsLoading(false));
	};

	const displayName = user?.displayName ?? safeLabel;
	const username = user?.username ?? safeLabel;
	const initial = displayName[0]?.toUpperCase() ?? "?";

	return (
		<HoverCard onOpenChange={handleOpenChange}>
			<HoverCardTrigger
				delay={400}
				closeDelay={200}
				render={(props) => (
					<a
						{...props}
						href={`/u/${id}`}
						className="tiptap-mention cursor-pointer"
						data-mention-id={id}
						data-mention-label={safeLabel}
						onClick={(e) => e.preventDefault()}
					>
						@{safeLabel}
					</a>
				)}
			/>

			{/* Added z-[100] to ensure it shows over the prose block */}
			<HoverCardContent side="top" align="start" className="w-64 p-3 z-[100]">
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
