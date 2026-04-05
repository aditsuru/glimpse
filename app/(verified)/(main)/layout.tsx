import { ScrollContainer } from "@/components/layout/ScrollContainer";
import Profile from "@/components/profiles/Profile";
import type { OutputProfile } from "@/server/shared/schemas/profile";

const mockProfile: OutputProfile = {
	userId: "user_123",
	name: "Adi",
	username: "aditsuru",
	avatarUrl:
		"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
	bannerUrl:
		"https://i.pinimg.com/736x/e2/6b/fd/e26bfdf90db9ac3fabc777a5c771c544.jpg",
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
		<div className="lg:grid lg:grid-cols-3 h-dvh w-dvw lg:px-16">
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
