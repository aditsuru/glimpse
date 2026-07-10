import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/shared/metadata";

export const metadata: Metadata = buildMetadata({
	title: "Account Suspended",
	noindex: true,
});

export default function BannedPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-center px-4 gap-4">
			<ShieldAlert size={55} />
			<h1 className="text-2xl font-bold">Account Suspended</h1>
			<p className="text-muted-foreground max-w-md">
				Your account has been suspended for violating our community guidelines.
				If you believe this is a mistake, contact{" "}
				<a href="mailto:support@aditsuru.com" className="underline">
					support@aditsuru.com
				</a>
				.
			</p>
		</div>
	);
}
