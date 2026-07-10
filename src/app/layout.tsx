import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ProgressBarTrigger } from "@/components/layout/ProgressBarTrigger";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { cn } from "@/lib/client/utils";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL("https://glimpse.aditsuru.com"),
	title: {
		default: "Glimpse",
		template: "%s · Glimpse",
	},
	description:
		"Share moments, follow people, see what's trending. Glimpse is where it's happening right now.",
	robots: {
		index: true,
		follow: true,
	},
	manifest: "/manifest.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn("font-sans", inter.variable)}
			suppressHydrationWarning
		>
			<body className={`${geistMono.variable} antialiased dark`}>
				<Providers>
					{children}
					<SmoothCursor />
				</Providers>
				<Suspense fallback={null}>
					<ProgressBar />
					<ProgressBarTrigger />
				</Suspense>
			</body>
		</html>
	);
}
