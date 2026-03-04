"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { config } from "@/lib/config";

const COOLDOWN_SECONDS = config.NEXT_PUBLIC_VERIFICATION_EMAIL_RESEND_TIMEOUT;
const STORAGE_KEY = "resend_email_cooldown";

function getSecondsLeft() {
	if (typeof window === "undefined") return 0;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return 0;
	const sentAt = parseInt(stored, 10);
	const elapsed = Math.floor((Date.now() - sentAt) / 1000);
	const remaining = COOLDOWN_SECONDS - elapsed;
	return remaining > 0 ? remaining : 0;
}

function ResendEmailButton() {
	const [secondsLeft, setSecondsLeft] = useState(0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setSecondsLeft(getSecondsLeft());
	}, []);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		const timeout = setTimeout(() => {
			setSecondsLeft((prev) => prev - 1);
		}, 1000);
		return () => clearTimeout(timeout);
	}, [secondsLeft]);

	const handleClick = async () => {
		toast("Verification email sent!", {position: "top-center"});
		localStorage.setItem(STORAGE_KEY, Date.now().toString());
		setSecondsLeft(COOLDOWN_SECONDS);
	};

	const isOnCooldown = mounted && secondsLeft > 0;

	return (
		<Button
			onClick={handleClick}
			disabled={isOnCooldown}
			className="hover:opacity-90 w-full cursor-none font-bold"
		>
			{isOnCooldown ? `Resend in ${secondsLeft}s` : "Resend Verification Email"}
		</Button>
	);
}

export default ResendEmailButton;
