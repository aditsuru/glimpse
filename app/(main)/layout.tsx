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
				<div className="hidden lg:flex flex-col col-span-1 min-h-full bg-background rounded-3xl px-6">
					<SidebarProfile />
				</div>

				{/* Menu */}
				<div className="col-span-1 lg:col-span-2 h-full overflow-y-auto w-full bg-background lg:rounded-3xl pb-20 lg:pb-0">
					{children}
				</div>

				{/* Options */}
				<div className="lg:hidden fixed right-0 left-0 bottom-0 w-full bg-background flex justify-between items-center p-4 px-8 border-t-4 border-foreground z-50">
					<MobileNavbar />
				</div>

				{/* Search Bar */}
				<div className="hidden lg:flex flex-col col-span-1 rounded-3xl bg-background h-full w-full overflow-hidden">
					<SidebarSearch />
				</div>
			</div>
		</div>
	);
}
