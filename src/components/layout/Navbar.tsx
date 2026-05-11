"use client";

import {
	Bell,
	Bookmark,
	Ellipsis,
	Home,
	LogOut,
	Search,
	Settings,
	User,
	UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOnboardingTooltip } from "@/hooks/useOnboardingTooltip";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { SIDEBAR_GIFS } from "@/lib/shared/static-files";
import { usePendingReceivedCount } from "@/modules/follow/follow.queries";
import { useProfile } from "@/modules/profile/profile.queries";
import { usePostComposerStore } from "@/store/use-post-composer-store";
import { useSettingsStore } from "@/store/use-settings-store";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const navItems = [
	{ label: "Home", href: "/", icon: Home },
	{ label: "Explore", href: "/explore", icon: Search },
	{ label: "Follow", href: "/requests/received", icon: UserPlus },
	{ label: "Notifications", href: "/notifications", icon: Bell },
	{ label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
	{ label: "Profile", href: "/profile", icon: User },
	{ label: "Settings", href: "/settings", icon: Settings },
];

type NavbarProps = {
	userId: string;
};

export const Navbar = ({ userId }: NavbarProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const isSidebarGifGalleryEnabled = useSettingsStore(
		(state) => state.isSidebarGifGalleryEnabled
	);
	const { open: openPostComposer } = usePostComposerStore();

	const { data, error, isLoading } = useProfile({
		userId,
	});

	const { data: followCountData } = usePendingReceivedCount();

	const { open, onHoverStart, onHoverEnd, isOnboardingDone } =
		useOnboardingTooltip();

	useEffect(() => {
		if (error)
			toast.error(
				"Failed to load profile. Please refresh the page and try again later."
			);
	}, [error]);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [signOutOpen, setSignOutOpen] = useState(false);

	useEffect(() => {
		setCurrentIndex(Math.floor(Math.random() * SIDEBAR_GIFS.length));

		const interval = setInterval(() => {
			if (!isSidebarGifGalleryEnabled) return;
			setCurrentIndex((i) => (i + 1) % SIDEBAR_GIFS.length);
		}, 15000);

		return () => clearInterval(interval);
	}, [isSidebarGifGalleryEnabled]);

	const gifUrl = SIDEBAR_GIFS[currentIndex];

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

	return (
		<nav className="w-full h-full px-8 grid xl:grid-cols-2 xl:gap-8">
			{isSidebarGifGalleryEnabled && (
				<div className="col-span-1 border-x-4 border-[#6c6c6c] w-full h-full overflow-hidden relative max-xl:hidden">
					<Image
						src={gifUrl}
						alt="banner"
						fill
						className="object-cover"
						unoptimized
						priority
					/>
				</div>
			)}
			<div className="xl:col-start-2 flex flex-col justify-start gap-4 pt-8 pb-8">
				{/* Logo */}
				<div className="mb-2 px-3">
					<Image
						src="/static/logo.png"
						alt="Logo"
						width={40}
						height={40}
						priority
					/>
				</div>

				{/* Nav Items */}
				{navItems.map(({ label, href, icon: Icon }) => {
					const resolvedHref =
						label === "Profile" ? `/${data?.username || ""}` : href;

					const isActive = pathname === resolvedHref;

					if (resolvedHref === "/settings") {
						return (
							<Tooltip
								key={label}
								open={isOnboardingDone ? open : false}
								onOpenChange={(nextOpen) => {
									if (!nextOpen) onHoverStart();
								}}
							>
								<TooltipTrigger
									render={
										<Link
											href={resolvedHref}
											onMouseEnter={onHoverStart}
											onMouseLeave={onHoverEnd}
											onFocus={onHoverStart}
											className={cn(
												"flex items-center gap-4 px-3 py-3 rounded-full text-xl transition-colors hover:bg-accent w-full",
												{ "font-bold": isActive }
											)}
										>
											<Icon className="size-7 shrink-0" />
											<span>{label}</span>
										</Link>
									}
								/>
								<TooltipContent
									className="text-base px-4 font-semibold"
									side="left"
								>
									Customize your experience
								</TooltipContent>
							</Tooltip>
						);
					}

					if (resolvedHref === "/requests/received") {
						return (
							<Link
								key={label}
								href={resolvedHref}
								className={cn(
									"flex items-center gap-4 px-[14px] py-3 rounded-full text-xl transition-colors hover:bg-accent w-full",
									{ "font-bold": isActive }
								)}
							>
								<div className="relative inline-flex">
									<Icon className="size-7 shrink-0" />
									{followCountData && followCountData.count !== 0 && (
										<span className="absolute -top-1.5 -right-1.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold ring-background ring">
											{followCountData.count}
										</span>
									)}
								</div>
								<span>{label}</span>
							</Link>
						);
					}

					return (
						<Link
							key={label}
							href={resolvedHref}
							className={cn(
								"flex items-center gap-4 px-3 py-3 rounded-full text-xl transition-colors hover:bg-accent w-full",
								{ "font-bold": isActive }
							)}
						>
							<Icon className="size-7 shrink-0" />
							<span>{label}</span>
						</Link>
					);
				})}

				{/* Post Button */}
				<button
					type="button"
					className="mt-4 w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:brightness-90 transition-all text-center"
					onClick={openPostComposer}
				>
					Post
				</button>

				{/* User Profile */}
				<Popover>
					<PopoverTrigger
						nativeButton={false}
						render={(props) => (
							<div
								{...props}
								className="mt-auto flex items-center gap-3 px-3 py-3 rounded-full hover:bg-accent transition-colors w-full"
							>
								{isLoading || error ? (
									<Skeleton className="size-10 rounded-full shrink-0" />
								) : (
									<Avatar className="size-10 shrink-0">
										<AvatarImage
											src={data?.avatarUrl ?? "/static/default-pfp.png"}
										/>
									</Avatar>
								)}

								{isLoading || error ? (
									<div className="flex flex-col min-w-0 gap-1">
										<Skeleton className="h-3 w-24 rounded" />
										<Skeleton className="h-3 w-16 rounded" />
									</div>
								) : (
									<div className="flex flex-col min-w-0">
										<span className="font-bold text-base truncate">
											{data?.displayName}
										</span>
										<span className="text-muted-foreground text-sm truncate">
											@{data?.username}
										</span>
									</div>
								)}

								<div className="flex-1 flex justify-end px-2">
									<Ellipsis className="size-5 shrink-0" />
								</div>
							</div>
						)}
					/>
					<PopoverContent
						side="top"
						align="center"
						className="w-60 p-0 rounded-full ring-0"
					>
						<Button
							onClick={() => setSignOutOpen(true)}
							variant="destructive"
							className="rounded-full p-6 text-base "
						>
							<LogOut className="size-5 shrink-0" />
							Sign out @{data?.username}
						</Button>
					</PopoverContent>
				</Popover>
				<Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="text-lg">Sign out?</DialogTitle>
							<DialogDescription className="text-base">
								You can always sign back in at any time.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setSignOutOpen(false)}>
								Cancel
							</Button>
							<Button variant="destructive" onClick={handleSignOut}>
								Sign out
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</nav>
	);
};
