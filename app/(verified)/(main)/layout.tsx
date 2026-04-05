import { ScrollContainer } from "@/components/layout/ScrollContainer";
import Profile from "@/components/profiles/Profile";
import type { OutputProfile } from "@/server/shared/schemas/profile";

const mockProfile: OutputProfile = {
	userId: "user_123",
	name: "Adi",
	username: "aditsuru",
	avatarUrl:
		"https://i.pinimg.com/736x/34/70/7c/34707c611749ddab412cad6991f6f2ae.jpg",
	bannerUrl:
		"https://i.pinimg.com/1200x/e2/0e/f8/e20ef817c48c3ab3002510625db21f2f.jpg",
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
			<ScrollContainer className="min-h-dvh lg:block h-full col-span-1 overflow-y-auto [overflow-anchor:none] no-scrollbar border-r border-l border-accent">
				{children}
			</ScrollContainer>

			{/* Col 3 — Search + nav, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto border-r">
				{/* <SearchSidebar /> */}
			</div>
		</div>
	);
}
