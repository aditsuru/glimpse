"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/client/utils";
import { useViewerStore } from "@/store/use-viewer-store";

type ProfileNavbarProps = {
	username: string;
	userId: string;
};

export const ProfileNavbar = ({ username, userId }: ProfileNavbarProps) => {
	const pathname = usePathname();
	const { userId: viewerUserId } = useViewerStore();

	const tabs = [
		{ label: "Posts", href: `/${username}` },
		{ label: "Comments", href: `/${username}/comments` },
	];

	if (userId === viewerUserId)
		tabs.push({ label: "Likes", href: `/${username}/likes` });

	return (
		<div className="mt-4 flex bg-background/80 border-b border-accent">
			{tabs.map(({ label, href }) => {
				const active = pathname === href;
				return (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex-1 text-center py-3 transition-colors hover:bg-accent/40 relative text-base",
							active ? "font-bold text-foreground" : "text-muted-foreground"
						)}
					>
						{label}
						{active && (
							<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-primary rounded-full" />
						)}
					</Link>
				);
			})}
		</div>
	);
};
