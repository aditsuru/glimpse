"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import AnimatedFieldError from "@/components/misc/AnimatedFieldError";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";

const FormSchema = z
	.object({
		password: z
			.string({ error: "Password is required" })
			.min(8, "Password must be 8 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z
			.string({ error: "Confirm password is required" })
			.min(1, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

const ResetPassword = () => {
	const pageRouter = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (!token) {
			toast.error("Invalid or missing reset token.");
			pageRouter.replace("/forgot-password");
		}
	}, [token, pageRouter]);

	const { formState, handleSubmit, control, setError, clearErrors } = useForm<
		z.infer<typeof FormSchema>
	>({
		resolver: zodResolver(FormSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const handleFormSubmit = async (formData: z.infer<typeof FormSchema>) => {
		if (!token) return;

		const { error } = await authClient.resetPassword({
			newPassword: formData.password,
			token,
		});

		if (error) {
			setError("root", {
				message: error.message || "Failed to reset password.",
			});
			return;
		}

		setIsRedirecting(true);
		toast.success("Password updated successfully! You can now sign in.");
		pageRouter.push("/sign-in");
	};

	if (!token) return null;

	return (
		<main className="w-screen h-dvh flex justify-center items-center">
			<Card className="w-[400px]">
				<CardHeader className="w-full">
					<CardTitle
						className={cn({
							"text-muted-foreground": formState.isSubmitting || isRedirecting,
						})}
					>
						Reset Password
					</CardTitle>
					<CardDescription
						className={cn({
							"text-muted-foreground/60":
								formState.isSubmitting || isRedirecting,
						})}
					>
						Create a new password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(handleFormSubmit)}
						className={cn({
							"text-muted-foreground/60":
								formState.isSubmitting || isRedirecting,
						})}
					>
						<fieldset
							disabled={formState.isSubmitting || isRedirecting}
							className="contents"
						>
							<FieldGroup onFocusCapture={() => clearErrors("root")}>
								{/* Password */}
								<Controller
									name="password"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>New Password</FieldLabel>
											<Input
												{...field}
												id={field.name}
												aria-invalid={fieldState.invalid}
												type="password"
												autoComplete="new-password"
											/>
											<AnimatedFieldError
												invalid={fieldState.invalid}
												errors={fieldState.error}
											/>
										</Field>
									)}
								/>
								{/* Confirm Password */}
								<Controller
									name="confirmPassword"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>
												Confirm Password
											</FieldLabel>
											<Input
												{...field}
												id={field.name}
												aria-invalid={fieldState.invalid}
												type="password"
												autoComplete="new-password"
											/>
											<AnimatedFieldError
												invalid={fieldState.invalid}
												errors={fieldState.error}
											/>
										</Field>
									)}
								/>
								<div className="w-full">
									<AnimatePresence mode="wait">
										{formState.errors.root && (
											<motion.div
												initial={{ opacity: 0, height: 0, y: 5 }}
												animate={{ opacity: 1, height: "auto", y: 0 }}
												exit={{ opacity: 0, height: 0, y: 5 }}
												transition={{ duration: 0.3, ease: "easeOut" }}
												className="mb-2"
											>
												<FieldError errors={[formState.errors.root]} />
											</motion.div>
										)}
									</AnimatePresence>
									<Button
										type="submit"
										disabled={formState.isSubmitting || isRedirecting}
										className="w-full"
									>
										{formState.isSubmitting || isRedirecting ? (
											<Spinner />
										) : (
											"Update Password"
										)}
									</Button>
								</div>
							</FieldGroup>
						</fieldset>
					</form>
				</CardContent>
			</Card>
		</main>
	);
};

export default ResetPassword;
