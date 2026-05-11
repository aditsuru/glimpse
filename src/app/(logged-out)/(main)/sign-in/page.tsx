"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AnimatedFieldError } from "@/components/misc/AnimatedFieldError";
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
import OAuth from "../OAuth";

const signInSchema = z.object({
	email: z.email("Email must be valid"),
	password: z
		.string({ error: "Password is required" })
		.nonempty("Password is required"),
});

export default function Page() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam) {
			toast.error("Authentication failed. Please try again.");

			router.replace("/sign-in");
		}
	}, [searchParams, router]);

	const { formState, handleSubmit, control, setError, clearErrors } = useForm<
		z.infer<typeof signInSchema>
	>({
		resolver: zodResolver(signInSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleFormSubmit = async (formData: z.infer<typeof signInSchema>) => {
		const { error, data } = await authClient.signIn.email({
			email: formData.email,
			password: formData.password,
		});

		if (error) {
			setError("root", {
				message: error.message ?? "Something went wrong. Please try again.",
			});
			return;
		}

		setIsRedirecting(true);

		if (!data.user.emailVerified) {
			router.push("/verify-email");
			return;
		}
		router.push("/");
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
					Don't have an account?{" "}
					<Link
						href="/sign-up"
						className="underline underline-offset-4 hover:text-primary"
					>
						Sign up
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
							{/* Password */}
							<Controller
								name="password"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex justify-between">
											<FieldLabel htmlFor={field.name}>Password</FieldLabel>

											<Link
												className={cn(
													"text-sm text-muted-foreground underline underline-offset-4 hover:text-primary",
													{
														"pointer-events-none text-muted-foreground/60":
															formState.isSubmitting || isRedirecting,
													}
												)}
												href="/forgot-password"
											>
												Forgot password?
											</Link>
										</div>

										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											type="password"
											autoComplete="current-password"
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
										"Sign In"
									)}
								</Button>
							</div>
						</FieldGroup>
					</fieldset>
				</form>
				<OAuth
					disabled={formState.isSubmitting || isRedirecting}
					context="sign-in"
				/>
			</FieldGroup>
		</main>
	);
}
