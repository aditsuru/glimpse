import Profile from "@/components/profiles/Profile";
import type { OutputProfile } from "@/server/shared/schemas/profile";

const mockProfile: OutputProfile = {
	userId: "user_123",
	name: "Aditya Chandra",
	username: "adityachandra",
	avatarUrl:
		"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
	bannerUrl:
		"https://i.pinimg.com/736x/29/6e/de/296ede1a68a8feebef14aa2b593594a6.jpg",
	bio: "Building something cool. Previously @google.\nPassionate about distributed systems and great UI.\n\nOpen to collabs 🤝",
	website: "https://aditya.dev",
	isGlimpseVerified: true,
	followersCount: 12400,
	followingsCount: 321,
	isFollowingUser: false,
	isFollowedByUser: true,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="lg:grid lg:grid-cols-3 h-dvh w-dvw px-16">
			{/* Col 1 — Profile card, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto border-l">
				<Profile {...mockProfile} />
			</div>

			{/* Col 2 — Main content */}
			<div className="min-h-dvh lg:block h-full col-span-1 overflow-y-auto [overflow-anchor:none] no-scrollbar border-r border-l border-accent">
				{children}
			</div>

			{/* Col 3 — Search + nav, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto border-r">
				{/* <SearchSidebar /> */}
			</div>
		</div>
	);
}
