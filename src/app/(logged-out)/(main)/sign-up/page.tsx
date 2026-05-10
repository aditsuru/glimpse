"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import AnimatedFieldError from "@/components/misc/AnimatedFieldError";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { config } from "@/lib/shared/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";
import OAuth from "../OAuth";

const signUpSchema = z
	.object({
		email: z.email("Email must be valid"),
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

const Page = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam) {
			toast.error("Authentication failed. Please try again.");

			router.replace("/sign-up");
		}
	}, [searchParams, router]);

	const { formState, handleSubmit, control, setError, clearErrors } = useForm<
		z.infer<typeof signUpSchema>
	>({
		resolver: zodResolver(signUpSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleFormSubmit = async (formData: z.infer<typeof signUpSchema>) => {
		const { error, data } = await authClient.signUp.email({
			email: formData.email,
			password: formData.password,
			name: formData.email.replace("@", "").replaceAll(".", ""),
		});
		if (error) {
			setError("root", {
				message: error.message ?? "Something went wrong. Please try again.",
			});
			return;
		}
		setIsRedirecting(true);
		if (!data.user.emailVerified) {
			localStorage.setItem(
				LOCAL_STORAGE_KEYS.VERIFY_EMAIL_COOLDOWN,
				(Date.now() + config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT).toString()
			);
			router.push("/verify-email?sent=true");
			return;
		}
		router.push("/onboarding");
	};

	return (
		<main className="flex flex-col items-center">
			<Avatar className="size-14 after:border-0">
				<AvatarImage src="/static/logo.png" />
				<AvatarFallback className="text-2xl">G</AvatarFallback>
			</Avatar>
			<header className="w-full text-center my-2">
				<h1 className="text-2xl font-bold">Welcome To Glimpse</h1>
				<p
					className={cn("text-muted-foreground mt-2 text-sm", {
						"pointer-events-none text-muted-foreground/60":
							formState.isSubmitting || isRedirecting,
					})}
				>
					Already have an account?{" "}
					<Link
						href="/sign-in"
						className="underline underline-offset-4 hover:text-primary"
					>
						Sign in
					</Link>
				</p>
			</header>
			<FieldGroup>
				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className={cn("w-full mt-4", {
						"text-muted-foreground/60": formState.isSubmitting || isRedirecting,
					})}
				>
					<fieldset
						disabled={formState.isSubmitting || isRedirecting}
						className="contents"
					>
						<FieldGroup onFocusCapture={() => clearErrors("root")}>
							{/* Email */}
							<Controller
								name="email"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											type="email"
											autoComplete="email"
										/>

										<AnimatedFieldError
											invalid={fieldState.invalid}
											errors={fieldState.error}
										/>
									</Field>
								)}
							/>
							<FieldGroup className="flex flex-row gap-4">
								{/* Password */}
								<Controller
									name="password"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>

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
							</FieldGroup>
							<div className="w-full">
								<AnimatePresence mode="wait">
									{formState.errors.root && (
										<motion.div
											initial={{ opacity: 0, height: 0, y: 5 }}
											animate={{ opacity: 1, height: "auto", y: 0 }}
											exit={{ opacity: 0, height: 0, y: 5 }}
											transition={{
												duration: 0.3,
												ease: "easeOut",
											}}
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
										"Sign Up"
									)}
								</Button>
							</div>
						</FieldGroup>
					</fieldset>
				</form>
				<OAuth
					disabled={formState.isSubmitting || isRedirecting}
					context="sign-up"
				/>
			</FieldGroup>
		</main>
	);
};

export default Page;
