export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="w-screen h-dvh overflow-hidden grid grid-cols-6">
			{/* Profile Sidebar */}
			<section className="col-span-2 border-accent border-r-2 h-full"></section>

			{/* Main Content */}
			<section className="col-span-2 border-accent border-r-2 overflow-hidden h-full">
				{children}
			</section>

			{/* Secondary Sidebar */}
			<section className="col-span-2"></section>
		</div>
	);
}
