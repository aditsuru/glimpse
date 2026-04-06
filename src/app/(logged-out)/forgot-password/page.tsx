"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { CooldownButton } from "@/components/form/CooldownButton";
import InputController from "@/components/form/InputController";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/client/auth-client";
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

const ForgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email address"),
});
type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPassword() {
	const form = useForm<ForgotPasswordSchemaType>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: "",
		},
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const { secondsLeft, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.FORGOT_PASSWORD_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT || 30000
	);

	const handleOnSubmit = async (values: ForgotPasswordSchemaType) => {
		const { error } = await authClient.requestPasswordReset({
			email: values.email,
			redirectTo: "/reset-password",
		});

		if (error) {
			form.setError("root", {
				message: error.message || "Failed to send reset link.",
			});
			return;
		}

		startCooldown();
		toast.success(
			"If an account exists, a reset link has been sent to your email."
		);
	};

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader>
						<CardTitle>Reset Password</CardTitle>
						<CardDescription>
							Enter your email to receive a password reset link.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={form.handleSubmit(handleOnSubmit)}>
							<FieldGroup onFocusCapture={() => form.clearErrors("root")}>
								<InputController
									control={form.control}
									name="email"
									type="email"
									formState={form.formState}
									label="Email"
								/>

								{form.formState.errors.root && (
									<div className="text-sm font-medium text-destructive mt-1">
										{form.formState.errors.root.message}
									</div>
								)}

								<CooldownButton
									label="Send Reset Link"
									secondsLeft={secondsLeft}
									isSubmitting={form.formState.isSubmitting}
									className="w-full"
								/>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
