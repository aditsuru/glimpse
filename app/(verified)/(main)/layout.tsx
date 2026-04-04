export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="lg:grid lg:grid-cols-4 h-dvh w-dvw gap-4 px-16">
			{/* Col 1 — Profile card, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto">
				{/* <ProfileCard /> */}
			</div>

			{/* Col 2–3 — Main content */}
			<div className="min-h-dvh lg:block h-full col-span-2 overflow-y-auto [overflow-anchor:none]">
				{children}
			</div>

			{/* Col 4 — Search + nav, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto">
				{/* <SearchSidebar /> */}
			</div>
		</div>
	);
}
