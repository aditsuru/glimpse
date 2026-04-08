/** biome-ignore-all lint/correctness/useExhaustiveDependencies: selectItem is stable within render */
/** biome-ignore-all lint/a11y/useButtonType: toggle buttons inside a listbox role */
"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentionUser } from "@/primitives/editor/types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MentionListProps {
	items: MentionUser[];
	command: (item: { id: string; label: string }) => void;
}

export interface MentionListHandle {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const MentionList = forwardRef<MentionListHandle, MentionListProps>(
	({ items, command }, ref) => {
		const [selectedIndex, setSelectedIndex] = useState(0);

		// Reset selection when the list changes
		useEffect(() => {
			setSelectedIndex(0);
		}, [items]);

		const selectItem = (index: number) => {
			const item = items[index];
			if (item) {
				command({ id: item.id, label: item.username });
			}
		};

		useImperativeHandle(ref, () => ({
			onKeyDown({ event }: { event: KeyboardEvent }): boolean {
				if (event.key === "ArrowUp") {
					setSelectedIndex((i) => (i + items.length - 1) % items.length);
					return true;
				}
				if (event.key === "ArrowDown") {
					setSelectedIndex((i) => (i + 1) % items.length);
					return true;
				}
				if (event.key === "Enter") {
					selectItem(selectedIndex);
					return true;
				}
				return false;
			},
		}));

		if (items.length === 0) {
			return (
				<div className="rounded-lg border bg-popover shadow-md p-2 min-w-[200px]">
					<p className="text-sm text-muted-foreground px-2 py-1.5">
						No users found
					</p>
				</div>
			);
		}

		return (
			<div
				role="listbox"
				aria-label="Mention suggestions"
				className="rounded-lg border bg-popover shadow-md p-1 min-w-[220px] max-h-[260px] overflow-y-auto z-50"
			>
				{items.map((user, index) => (
					<button
						key={user.id}
						type="button"
						role="option"
						aria-selected={index === selectedIndex}
						onClick={() => selectItem(index)}
						onMouseEnter={() => setSelectedIndex(index)}
						className={[
							"flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-md text-left",
							"transition-colors text-sm outline-none",
							index === selectedIndex
								? "bg-accent text-accent-foreground"
								: "hover:bg-accent hover:text-accent-foreground",
						].join(" ")}
					>
						<Avatar className="shrink-0" size="default">
							<AvatarImage src={user.avatarUrl} alt={user.displayName} />
							<AvatarFallback className="text-xs">
								{user.displayName[0]?.toUpperCase() ?? "?"}
							</AvatarFallback>
						</Avatar>

						<div className="flex flex-col min-w-0">
							<span className="font-medium truncate">{user.displayName}</span>
							<span className="text-xs text-muted-foreground truncate">
								@{user.username}
							</span>
						</div>
					</button>
				))}
			</div>
		);
	}
);

MentionList.displayName = "MentionList";
export default MentionList;
