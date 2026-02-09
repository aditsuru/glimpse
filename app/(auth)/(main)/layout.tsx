import { Card, CardContent } from "@/components/ui/card";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 cursor-none">
			<div className="w-full max-w-sm md:max-w-4xl">
				<div className={cn("flex flex-col gap-6")}>
					<Card className="overflow-hidden p-0">
						<CardContent className="grid p-0 md:grid-cols-2">
							<div className="flex flex-col justify-center p-6 md:p-10">
								<div className="w-full max-w-sm">{children}</div>
							</div>

							{/* Image Side */}
							<div className="bg-muted relative hidden md:block h-full min-h-[400px]">
								<Image
									src="/misc/login-banner.jpg"
									alt="Login Banner"
									fill
									priority
									className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2]"
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<SmoothCursor />
		</div>
	);
}
