"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

export default function Page() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isPending } = authClient.useSession();
	const [isLoading, setIsLoading] = useState(false);
	const { secondsLeft, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.VERIFY_EMAIL_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	useEffect(() => {
		if (searchParams.get("sent") === "true") {
			toast.success("A verification link has been sent to your email.");
			router.replace("/verify-email");
		}
	}, [router.replace, searchParams.get]);

	const handleResend = async () => {
		if (!session?.user.email) return;
		setIsLoading(true);

		const { error } = await authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/",
		});

		if (error) {
			toast.error(error.message || "Failed to resend verification email.");
		} else {
			startCooldown();
			toast.success("Verification email sent.");
		}

		setIsLoading(false);
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/sign-in");
	};

	if (isPending) return null;

	return (
		<main className="w-screen h-dvh flex justify-center items-center">
			<Card className="w-[400px]">
				<CardHeader>
					<CardTitle>Check your email</CardTitle>
					<CardDescription>
						We just sent an email to{" "}
						<span className="text-foreground">{session?.user.email}</span>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						type="button"
						onClick={handleResend}
						disabled={secondsLeft === null || secondsLeft > 0 || isLoading}
						className="w-full"
					>
						{isLoading ? (
							<Spinner />
						) : secondsLeft !== null && secondsLeft > 0 ? (
							`Wait ${secondsLeft}s to resend`
						) : (
							"Resend email"
						)}
					</Button>
					<AlertDialog>
						<AlertDialogTrigger
							render={
								<Button variant="destructive" className="w-full mt-2">
									Sign Out
								</Button>
							}
						/>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you sure?</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to sign out?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									onClick={handleSignOut}
								>
									Sign Out
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</CardContent>
			</Card>
		</main>
	);
}
