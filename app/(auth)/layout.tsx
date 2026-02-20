import { SmoothCursor } from "@/components/ui/smooth-cursor";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="hide-native-cursor">
			{children}
			<SmoothCursor />
		</div>
	);
}
