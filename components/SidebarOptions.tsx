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
import { authClient } from "@/lib/clients/auth-client";

const navItems = [
	{ label: "Feed", icon: Home01Icon, href: "/" },
	{ label: "Create", icon: PlusSignCircleIcon, href: "/create-post" },
	{ label: "Profile", icon: UserIcon, href: "/profile" },
	{ label: "Settings", icon: Settings01Icon, href: "/settings" },
];

function SidebarOptions() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	return (
		<div className="flex flex-col items-start gap-4 w-full mb-12 mt-auto">
			{navItems.map(({ label, icon, href }) => {
				let isActive = pathname === href;
				if (href === "/profile")
					isActive = pathname === `/profile/${session?.user.username}`;
				return (
					<Link
						key={href}
						href={
							href === "/profile" ? `/profile/${session?.user.username}` : href
						}
						className={`flex gap-2 items-center cursor-none ${isActive ? "text-primary pointer-events-none" : "hover:scale-105"} transition-all duration-150`}
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
