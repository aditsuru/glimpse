"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/clients/auth-client";
import { config } from "@/lib/config";

const COOLDOWN_KEY = "resend_email_cooldown";
const COOLDOWN_TIME_MS = config.NEXT_PUBLIC_VERIFICATION_EMAIL_RESEND_TIMEOUT;

function ResendEmailButton({ className }: { className: string }) {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

	const { data: session, error } = authClient.useSession();
	console.log(error);
	useEffect(() => {
		const stored = localStorage.getItem(COOLDOWN_KEY);
		if (!stored) {
			setSecondsLeft(0);
			return;
		}
		const remaining = Math.ceil((parseInt(stored, 10) - Date.now()) / 1000);

		if (remaining <= 0) {
			localStorage.removeItem(COOLDOWN_KEY);
			setSecondsLeft(0);
			return;
		}

		setSecondsLeft(remaining);
	}, []);

	useEffect(() => {
		if (!secondsLeft || secondsLeft <= 0) return;

		const timeout = setTimeout(() => {
			setSecondsLeft((prev) => (prev as number) - 1);
		}, 1000);

		return () => clearTimeout(timeout);
	}, [secondsLeft]);

	const handleOnClick = async () => {
		if (!session) {
			toast.error("Something went wrong.", { position: "top-center" });
			router.push("/sign-in");
			return;
		}

		authClient.sendVerificationEmail({
			email: session.user.email,
			callbackURL: "/",
		});

		localStorage.setItem(
			COOLDOWN_KEY,
			(Date.now() + COOLDOWN_TIME_MS).toString()
		);
		setSecondsLeft(COOLDOWN_TIME_MS / 1000);

		toast.info("Verification email sent successfully!", {
			position: "top-center",
		});
	};

	if (secondsLeft === null)
		return (
			<Button className={className} disabled>
				Resend Verification Email
			</Button>
		);
	return (
		<Button
			className={className}
			onClick={handleOnClick}
			disabled={secondsLeft > 0}
		>
			{secondsLeft <= 0
				? "Resend Verification Email"
				: `You can resend again in ${secondsLeft}s`}{" "}
		</Button>
	);
}

export default ResendEmailButton;
