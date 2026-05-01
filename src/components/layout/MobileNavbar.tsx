"use client";

import { Bell, Home, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/client/utils";
import { useProfile } from "@/modules/profile/profile.queries";
import { Avatar, AvatarImage } from "../ui/avatar";

const mobileNavItems = [
	{ href: "/", icon: Home },
	{ href: "/notifications", icon: Bell },
	{ href: "/create-post", icon: PlusCircle },
	{ href: "/explore", icon: Search },
];

type MobileNavbarProps = {
	userId: string;
};

const MobileNav = ({ userId }: MobileNavbarProps) => {
	const pathname = usePathname();

	const { data } = useProfile({
		userId,
	});

	return (
		<nav className="shrink-0 md:hidden border-t border-accent flex justify-around items-center py-3 bg-background">
			{mobileNavItems.map(({ href, icon: Icon }) => (
				<Link key={href} href={href}>
					<Icon
						className={cn("size-7", { "stroke-[2.5px]": pathname === href })}
					/>
				</Link>
			))}
			<Avatar className="size-7 shrink-0">
				<AvatarImage src={data?.avatarUrl ?? "/static/default-pfp.png"} />
			</Avatar>
		</nav>
	);
};

export default MobileNav;
