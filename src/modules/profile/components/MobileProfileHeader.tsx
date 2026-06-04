"use client";

import { Bookmark, ChevronLeft, Menu, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { startProgress } from "@/lib/client/helpers";
import { cn } from "@/lib/client/utils";
import { usePendingReceivedCount } from "@/modules/follow/follow.queries";

const navItems = [
	{ label: "Follow", href: "/requests/received", icon: UserPlus },
	{ label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
	{ label: "Settings", href: "/settings", icon: Settings },
];

type MobileProfileHeaderProps = {
	title: string;
	className?: string;
	showMenu: boolean;
};

export const MobileProfileHeader = ({
	title,
	className,
	showMenu,
}: MobileProfileHeaderProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const { data: followCountData } = usePendingReceivedCount();

	return (
		<div
			className={cn(
				"flex items-center px-4 py-3 border-b border-accent sticky top-0 bg-background/80 backdrop-blur-sm z-10 h-18",
				className
			)}
		>
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						onClick={() => {
							startProgress();
							router.back();
						}}
						className="rounded-full p-2 hover:bg-accent transition-colors"
					>
						<ChevronLeft className="size-5" />
					</Button>
					<h1 className="text-xl font-bold">{title}</h1>
				</div>
				{showMenu && (
					<Drawer>
						<DrawerTrigger>
							<div className="relative inline-flex">
								<Menu />
								{followCountData && followCountData.count !== 0 && (
									<span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold ring-background ring">
										{followCountData.count}
									</span>
								)}
							</div>
						</DrawerTrigger>
						<DrawerContent className="pb-4">
							<DrawerHeader>
								<DrawerTitle className="text-xl font-semibold">
									Your Account
								</DrawerTitle>
							</DrawerHeader>
							{navItems.map(({ label, href, icon: Icon }) => {
								const isActive = pathname === href;
								return (
									<Link
										key={href}
										href={href}
										className={cn(
											"flex items-center gap-4 p-3 text-xl transition-colors hover:bg-accent w-full",
											{ "font-bold": isActive },
											{ "px-[14px] gap-3.5": href === "/requests/received" }
										)}
									>
										<div className="relative inline-flex">
											<Icon className="size-7 shrink-0" />
											{href === "/requests/received" &&
												followCountData &&
												followCountData.count !== 0 && (
													<span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold ring-background ring">
														{followCountData.count}
													</span>
												)}
										</div>
										<span>{label}</span>
									</Link>
								);
							})}
						</DrawerContent>
					</Drawer>
				)}
			</div>
		</div>
	);
};
