"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/client/utils";

const FeedHeader = () => {
	const pathname = usePathname();

	const tabs = [
		{ label: "For You", href: `/` },
		{ label: "Trending", href: `/trending` },
	];

	return (
		<div className="flex flex-col sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-accent h-14 md:h-18 justify-end">
			<div className="flex w-full items-center">
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
		</div>
	);
};

export default FeedHeader;
