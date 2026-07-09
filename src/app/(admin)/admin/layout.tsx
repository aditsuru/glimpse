import Image from "next/image";
import Link from "next/link";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { AdminNav } from "@/modules/admin-report/components/AdminNav";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col min-h-screen">
			<header className="flex items-center gap-4 px-6 py-4 border-b border-accent">
				<Link href="/">
					<Image
						src="/static/logo.png"
						alt="Logo"
						width={40}
						height={40}
						priority
						draggable={false}
					/>
				</Link>
				<h1 className="text-lg font-semibold">Admin Dashboard</h1>
				<AdminNav />
			</header>
			<main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
				{children}
			</main>
			<ConfirmDialog />
		</div>
	);
}
