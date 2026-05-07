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
		<div className="flex flex-col sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-accent justify-end">
			<div className="flex w-full items-center">
				{tabs.map(({ label, href }) => {
					const active = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex-1 text-center transition-colors hover:bg-accent/40 relative text-base h-14 md:h-18 flex items-center justify-center pt-4",
								active ? "font-bold text-foreground" : "text-muted-foreground"
							)}
						>
							<p>{label}</p>
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
