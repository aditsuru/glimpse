"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/client/utils";

type FollowHeaderProps = {
	username: string;
};

const FollowHeader = ({ username }: FollowHeaderProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const tabs = [
		{ label: "Followers", href: `/${username}/followers` },
		{ label: "Following", href: `/${username}/following` },
	];

	return (
		<div className="flex flex-col sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b border-accent">
			<div className="flex items-center gap-2 px-4 py-3">
				<Button
					onClick={() => router.back()}
					className="rounded-full p-2 hover:bg-accent transition-colors"
					variant="ghost"
				>
					<ChevronLeft className="size-5" />
				</Button>
				<h1 className="text-xl font-bold">{username}</h1>
			</div>
			<div className="flex w-full">
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

export default FollowHeader;
