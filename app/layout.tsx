import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Providers } from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const pacifico = Pacifico({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-glimpse",
});

export const metadata: Metadata = {
	title: "Glimpse",
	description: "Social Media app project by aditsuru",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased hide-native-cursor`}
			>
				<Providers>
					{children}
					<SmoothCursor />
				</Providers>
			</body>
		</html>
	);
}
