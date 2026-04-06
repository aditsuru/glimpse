"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import InputController from "@/components/form/InputController";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/client/auth-client";

const ResetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export default function ResetPassword() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	useEffect(() => {
		if (!token) {
			toast.error("Invalid or missing reset token.");
			router.push("/forgot-password");
		}
	}, [token, router]);

	const form = useForm<ResetPasswordSchemaType>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const handleOnSubmit = async (values: ResetPasswordSchemaType) => {
		if (!token) return;

		const { error } = await authClient.resetPassword({
			newPassword: values.password,
			token: token,
		});

		if (error) {
			form.setError("root", {
				message: error.message || "Failed to reset password.",
			});
			return;
		}

		toast.success("Password updated successfully! You can now sign in.");
		router.push("/sign-in");
	};

	if (!token) return null;

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardHeader>
						<CardTitle>Set New Password</CardTitle>
						<CardDescription>Enter your new password below.</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={form.handleSubmit(handleOnSubmit)}>
							<FieldGroup onFocusCapture={() => form.clearErrors("root")}>
								<InputController
									control={form.control}
									name="password"
									type="password"
									formState={form.formState}
									label="New Password"
								/>
								<InputController
									control={form.control}
									name="confirmPassword"
									type="password"
									formState={form.formState}
									label="Confirm Password"
								/>

								{form.formState.errors.root && (
									<div className="text-sm font-medium text-destructive mt-1">
										{form.formState.errors.root.message}
									</div>
								)}

								<Button
									type="submit"
									className="w-full"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? (
										<Spinner className="size-5" />
									) : (
										"Update Password"
									)}
								</Button>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
