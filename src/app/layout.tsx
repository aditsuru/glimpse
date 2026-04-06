import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Inter } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { cn } from "@/lib/client/utils";
import Providers from "./providers";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Glimpse",
	description: "A social media platform.",
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
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
			>
				<Providers>
					{children}
					<SmoothCursor />
				</Providers>
			</body>
		</html>
	);
}
