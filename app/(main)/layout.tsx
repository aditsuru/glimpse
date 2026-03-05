import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MobileNavbar from "@/components/MobileNavbar";
import SidebarProfile from "@/components/SidebarProfile";
import SidebarSearch from "@/components/SidebarSearch";
import { auth } from "@/lib/auth";

export default async function AuthGuard({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	if (!session.user.emailVerified) {
		redirect("/verify-email");
	}

	return (
		<div className="w-full h-screen lg:p-4 overflow-hidden text-foreground">
			<div className="grid grid-cols-1 lg:grid-cols-4 w-full h-full lg:gap-8">
				{/* sidebar */}
				<SidebarProfile />

				{/* Menu */}
				<div className="col-span-1 lg:col-span-2 h-full overflow-y-auto w-full bg-background lg:brightness-95 lg:rounded-3xl">
					{children}
				</div>
				{/* Options */}
				<MobileNavbar />

				{/* Search Bar */}
				<SidebarSearch />
			</div>
		</div>
	);
}
