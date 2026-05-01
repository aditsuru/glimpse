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
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { SIDEBAR_GIFS } from "@/lib/shared/constants";
import { useProfile } from "@/modules/profile/profile.queries";
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

const navItems = [
	{ label: "Home", href: "/", icon: Home },
	{ label: "Explore", href: "/explore", icon: Search },
	{ label: "Follow", href: "/follow", icon: UserPlus },
	{ label: "Notifications", href: "/notifications", icon: Bell },
	{ label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
	{ label: "Profile", href: "/aditsuru", icon: User },
	{ label: "Settings", href: "/settings", icon: Settings },
];

type NavbarProps = {
	userId: string;
};

const Navbar = ({ userId }: NavbarProps) => {
	const pathname = usePathname();
	const router = useRouter();

	const { data, error, isLoading } = useProfile({
		userId,
	});

	useEffect(() => {
		if (error)
			toast.error(
				"Failed to load profile. Please refresh the page and try again later."
			);
	}, [error]);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [SignOutOpen, setSignOutOpen] = useState(false);

	useEffect(() => {
		setCurrentIndex(Math.floor(Math.random() * SIDEBAR_GIFS.length));

		const interval = setInterval(() => {
			setCurrentIndex((i) => (i + 1) % SIDEBAR_GIFS.length);
		}, 10000);

		return () => clearInterval(interval);
	}, []);

	const gifUrl = SIDEBAR_GIFS[currentIndex];

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

	return (
		<nav className="w-full h-full px-8 grid xl:grid-cols-2 xl:gap-8">
			<div className="col-span-1 border-x-4 border-foreground w-full h-full overflow-hidden relative max-xl:hidden">
				<Image
					src={gifUrl}
					alt="banner"
					fill
					className="object-cover"
					unoptimized
					priority
				/>
			</div>
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
					const isActive = pathname === href;
					return (
						<Link
							key={href}
							href={href}
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
				<Link
					href="create-post"
					className="mt-4 w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-bold hover:brightness-90 transition-all text-center"
				>
					Post
				</Link>

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
				<Dialog open={SignOutOpen} onOpenChange={setSignOutOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="text-lg">Sign out?</DialogTitle>
							<DialogDescription>
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

export default Navbar;
