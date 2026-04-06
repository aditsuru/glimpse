"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CooldownButton } from "@/components/form/CooldownButton";
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

export function ResendEmailButton({ className }: { className?: string }) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: session } = authClient.useSession();

	const { secondsLeft, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.VERIFY_EMAIL_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	const handleClick = async () => {
		if (!session) {
			toast.error("Something went wrong.");
			router.push("/sign-in");
			return;
		}

		setIsSubmitting(true);
		try {
			const { error } = await authClient.sendVerificationEmail({
				email: session.user.email,
				callbackURL: "/",
			});

			if (error) {
				toast.error(error.message || "Failed to send email.");
				return;
			}

			startCooldown();
			toast.info("Verification email sent successfully!");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<CooldownButton
			label="Resend Verification Email"
			className={className}
			secondsLeft={secondsLeft}
			isSubmitting={isSubmitting}
			onClick={handleClick}
		/>
	);
}
