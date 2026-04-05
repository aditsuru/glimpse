import Profile from "@/components/profiles/Profile";
import type { OutputProfile } from "@/server/shared/schemas/profile";

const mockProfile: OutputProfile = {
	userId: "user_123",
	name: "Adi",
	username: "aditsuru",
	avatarUrl:
		"https://i.pinimg.com/736x/ac/49/20/ac492039353e5db837ad6d8057fa9925.jpg",
	bannerUrl:
		"https://i.pinimg.com/736x/d2/2b/f2/d22bf2b1d67b13598bf2234887f8f25e.jpg",
	bio: "Building something cool. Previously @google.\nPassionate about distributed systems and great UI.\n\nOpen to collabs 🤝",
	website: "https://aditsuru.com",
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
			<div className="hidden lg:block h-full col-span-1 border-l overflow-hidden">
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
