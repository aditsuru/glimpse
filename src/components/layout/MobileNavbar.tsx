"use client";

import { Bell, Home, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendingReceivedCount } from "@/modules/follow/follow.queries";
import { useGetUnreadNotificationCount } from "@/modules/notification/notification.queries";
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
	const pathname = usePathname();

	const { data } = useProfile({
		userId,
	});

	const { data: followCountData } = usePendingReceivedCount();
	const { data: unreadNotificationCount } = useGetUnreadNotificationCount();

	return (
		<nav className="shrink-0 md:hidden border-t border-accent flex justify-around items-center py-3 bg-background">
			{mobileNavItems.map(({ href, icon: Icon }) => {
				if (href === "/create-post")
					return (
						<button key={href} type="button" onClick={openPostComposer}>
							<Icon className="stroke-[2.5px]" />
						</button>
					);

				if (href === "/notifications")
					return (
						<Link key={href} href={href}>
							<div className="relative inline-flex">
								<Icon className="stroke-[2.5px]" />
								{unreadNotificationCount &&
									unreadNotificationCount.count !== 0 && (
										<span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold ring-background ring">
											{unreadNotificationCount.count}
										</span>
									)}
							</div>
						</Link>
					);

				return (
					<Link key={href} href={href}>
						<Icon className="stroke-[2.5px]" />
					</Link>
				);
			})}

			<Link href={`/${data?.username}`}>
				<div className="relative inline-flex">
					<Avatar className="size-7 shrink-0">
						<AvatarImage src={data?.avatarUrl ?? "/static/default-pfp.png"} />
					</Avatar>
					{pathname !== `/${data?.username}` &&
						followCountData &&
						followCountData.count !== 0 && (
							<span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold ring-background ring">
								{followCountData.count}
							</span>
						)}
				</div>
			</Link>
		</nav>
	);
};
