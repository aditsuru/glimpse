"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/client/utils";

const TABS = [
	{ href: "/admin/reports", label: "Reports" },
	{ href: "/admin/dmca", label: "DMCA" },
	{ href: "/admin/broadcast", label: "Broadcast" },
];

export const AdminNav = () => {
	const pathname = usePathname();

	return (
		<nav className="flex gap-1 ml-auto">
			{TABS.map((tab) => (
				<Link
					key={tab.href}
					href={tab.href}
					className={cn(
						"px-3 py-1.5 text-sm rounded-md transition-colors",
						pathname.startsWith(tab.href)
							? "bg-accent text-foreground font-medium"
							: "text-muted-foreground hover:bg-accent/50"
					)}
				>
					{tab.label}
				</Link>
			))}
		</nav>
	);
};
