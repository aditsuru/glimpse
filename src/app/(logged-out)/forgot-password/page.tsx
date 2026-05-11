"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedFieldError } from "@/components/misc/AnimatedFieldError";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

const forgotPasswordSchema = z.object({
	email: z.email("Enter a valid email"),
});

export default function Page() {
	const router = useRouter();
	const [email, setEmail] = React.useState("");
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const { secondsLeft, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.FORGOT_PASSWORD_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	const handleSubmit = async (e: React.ChangeEvent) => {
		e.preventDefault();
		const result = forgotPasswordSchema.safeParse({ email });
		if (!result.success) {
			setError(result.error.issues[0].message);
			return;
		}
		setError(null);
		setIsLoading(true);

		const { error } = await authClient.requestPasswordReset({
			email,
			redirectTo: "/reset-password",
		});

		if (error) {
			setError(error.message || "Failed to send reset link.");
			setIsLoading(false);
			return;
		}

		startCooldown();
		toast.success(
			"If an account exists, a reset link has been sent to your email."
		);
		setIsLoading(false);
	};

	return (
		<main className="w-screen h-dvh flex justify-center items-center">
			<Card className="w-[400px]">
				<CardHeader className="w-full">
					<div className="flex">
						<Button
							variant="link"
							className="px-0!"
							onClick={() => router.push("/sign-in")}
							disabled={isLoading}
						>
							<ChevronLeft />
							Return
						</Button>
					</div>
					<CardTitle className={cn({ "text-muted-foreground": isLoading })}>
						Forgot your password?
					</CardTitle>
					<CardDescription
						className={cn({ "text-muted-foreground/60": isLoading })}
					>
						Enter your email to receive a password reset link.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<Field data-invalid={!!error}>
							<FieldLabel
								htmlFor="email"
								className={cn({
									"text-muted-foreground":
										secondsLeft === null || secondsLeft > 0 || isLoading,
								})}
							>
								Email
							</FieldLabel>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setError(null);
								}}
								onBlur={() => {
									const result = forgotPasswordSchema.safeParse({ email });
									if (!result.success) setError(result.error.issues[0].message);
								}}
								autoComplete="email"
								aria-invalid={!!error}
								disabled={secondsLeft === null || secondsLeft > 0 || isLoading}
							/>
							<AnimatedFieldError
								errors={error ? { message: error } : undefined}
								invalid={error !== null}
							/>
						</Field>
						<Button
							type="submit"
							disabled={secondsLeft === null || secondsLeft > 0 || isLoading}
							className="w-full mt-4"
						>
							{isLoading ? (
								<Spinner className="mr-2" />
							) : secondsLeft !== null && secondsLeft > 0 ? (
								`Wait ${secondsLeft}s to resend`
							) : (
								"Resend email"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
