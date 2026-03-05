"use client";
import {
	Home01Icon,
	PlusSignCircleIcon,
	Settings01Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ label: "Feed", icon: Home01Icon, href: "/" },
	{ label: "Create", icon: PlusSignCircleIcon, href: "/create-post" },
	{ label: "Profile", icon: UserIcon, href: "/profile" },
	{ label: "Settings", icon: Settings01Icon, href: "/settings" },
];

function SidebarOptions() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col items-start gap-4 w-full mb-4 mt-auto">
			{navItems.map(({ label, icon, href }) => {
				const isActive = pathname === href;

				return (
					<Link
						key={href}
						href={href}
						className={`flex gap-2 items-center cursor-none ${isActive ? "text-muted-foreground" : "hover:scale-105"} transition-all duration-150`}
					>
						<HugeiconsIcon icon={icon} size={28} />
						<p className="text-lg font-semibold">{label}</p>
					</Link>
				);
			})}
		</div>
	);
}

export default SidebarOptions;
