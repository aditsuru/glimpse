export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="lg:grid lg:grid-cols-3 h-dvh w-dvw px-16">
			{/* Col 1 — Profile card, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto">
				{/* <ProfileCard /> */}
			</div>

			{/* Col 2 — Main content */}
			<div className="min-h-dvh lg:block h-full col-span-1 overflow-y-auto [overflow-anchor:none] no-scrollbar border-r border-l border-accent">
				{children}
			</div>

			{/* Col 3 — Search + nav, desktop only */}
			<div className="hidden lg:block h-full col-span-1 overflow-y-auto">
				{/* <SearchSidebar /> */}
			</div>
		</div>
	);
}
