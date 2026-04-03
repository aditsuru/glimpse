"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CooldownButton } from "@/components/form/CooldownButton";
import { authClient } from "@/lib/clients/auth-client";
import { config } from "@/lib/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

export function ResendEmailButton({ className }: { className?: string }) {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const handleClick = async (startCooldown: () => void) => {
		if (!session) {
			toast.error("Something went wrong.");
			router.push("/sign-in");
			return;
		}

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
	};

	return (
		<CooldownButton
			storageKey={LOCAL_STORAGE_KEYS.RESEND_EMAIL_COOLDOWN}
			cooldownMs={config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT}
			onClick={handleClick}
			label="Resend Verification Email"
			className={className}
		/>
	);
}
