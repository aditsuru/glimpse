"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const COOLDOWN_KEY = "resend_email_cooldown";
const COOLDOWN_TIME = 60;

function ResendEmailButton({
	className,
	fn,
}: {
	className: string;
	fn: () => void;
}) {
	const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem(COOLDOWN_KEY);
		if (!stored) {
			setSecondsLeft(0);
			return;
		}
		const remaining = Math.ceil((parseInt(stored, 10) - Date.now()) / 1000);

		if (remaining <= 0) {
			localStorage.removeItem(COOLDOWN_KEY);
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

	const handleOnClick = () => {
		fn();
		localStorage.setItem(
			COOLDOWN_KEY,
			(Date.now() + COOLDOWN_TIME * 1000).toString()
		);
		setSecondsLeft(COOLDOWN_TIME);
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
