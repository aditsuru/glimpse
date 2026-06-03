"use client";

import { Bell, Home, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/modules/profile/profile.queries";
import { usePostComposerStore } from "@/store/use-post-composer-store";
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

export const MobileNavbar = ({ userId }: MobileNavbarProps) => {
	const { open: openPostComposer } = usePostComposerStore();

	const { data } = useProfile({
		userId,
	});

	return (
		<nav className="shrink-0 md:hidden border-t border-accent flex justify-around items-center py-3 bg-background">
			{mobileNavItems.map(({ href, icon: Icon }) => {
				if (href === "/create-post")
					return (
						<button key={href} type="button" onClick={openPostComposer}>
							<Icon className="stroke-[2.5px]" />
						</button>
					);

				return (
					<Link key={href} href={href}>
						<Icon className="stroke-[2.5px]" />
					</Link>
				);
			})}
			<Link href={`/${data?.username}`}>
				<Avatar className="size-7 shrink-0">
					<AvatarImage src={data?.avatarUrl ?? "/static/default-pfp.png"} />
				</Avatar>
			</Link>
		</nav>
	);
};
