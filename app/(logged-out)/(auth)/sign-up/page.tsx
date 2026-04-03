"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputController from "@/components/form/InputController";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/clients/auth-client";
import { cn } from "@/lib/utils";
import { SignUpSchema, type SignUpSchemaType } from "../schema";

export default function SignUp() {
	const pageRouter = useRouter();

	const form = useForm<SignUpSchemaType>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			username: "",
			name: "",
		},
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const {
		formState: { isSubmitting },
		clearErrors,
	} = form;

	// Submit function
	const handleOnSubmit = async (formData: SignUpSchemaType) => {
		const { error, data } = await authClient.signUp.email({
			email: formData.email,
			password: formData.password,
			name: formData.name,
			username: formData.username,
		});

		if (error) {
			form.setError("root", {
				message: error.message ?? "Something went wrong. Please try again.",
			});
			return;
		}

		if (!data.user.emailVerified) pageRouter.push("/verify-email");
		pageRouter.push("/");
	};

	// OAuth Sign-up
	const handleSignUp = async (provider: "google" | "github") => {
		await authClient.signIn.social({
			provider: provider,
			callbackURL: "/",
			errorCallbackURL: "/sign-up?error=true",
		});
	};

	return (
		<div className={cn("flex flex-col gap-6")}>
			<form onSubmit={form.handleSubmit(handleOnSubmit)}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link
							href="#"
							className="flex flex-col items-center gap-2 font-medium"
						>
							<div className="flex items-center justify-center rounded-md">
								<Avatar size="lg">
									<AvatarImage
										src="/static/logo.png"
										alt="Glimpse"
										className="grayscale"
									/>
									<AvatarFallback>G</AvatarFallback>
								</Avatar>
							</div>
							<span className="sr-only">Glimpse</span>
						</Link>

						<h1 className="text-xl font-bold">Welcome to Glimpse</h1>
						<FieldDescription
							className={`${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
						>
							Already have an account? <Link href="/sign-in">Sign In</Link>
						</FieldDescription>
					</div>
					<FieldGroup onFocusCapture={() => clearErrors("root")}>
						<InputController
							control={form.control}
							name="name"
							type="text"
							formState={form.formState}
							label="Your Name"
						/>
						<InputController
							control={form.control}
							name="username"
							type="text"
							formState={form.formState}
							label="Username"
						/>
						<InputController
							control={form.control}
							name="email"
							type="email"
							formState={form.formState}
							label="Email"
						/>
						<div>
							<div className="flex gap-4">
								<InputController
									control={form.control}
									name="password"
									type="password"
									formState={form.formState}
									label="Password"
								/>
								<InputController
									control={form.control}
									name="confirmPassword"
									type="password"
									formState={form.formState}
									label="Confirm Password"
								/>
							</div>
							<AnimatePresence mode="wait">
								{form.formState.errors.root && (
									<motion.div
										initial={{ opacity: 0, height: 0, y: -5 }}
										animate={{ opacity: 1, height: "auto", y: 0 }}
										exit={{ opacity: 0, height: 0, y: -5 }}
										transition={{
											duration: 0.25,
											ease: "easeInOut",
										}}
										className="overflow-hidden mt-2"
									>
										<div>
											<FieldError errors={[form.formState.errors.root]} />
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</FieldGroup>
					<Field>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<div className="flex justify-center items-center gap-2">
									<Spinner className="size-5" />
								</div>
							) : (
								"Create Account"
							)}
						</Button>
					</Field>
					<FieldSeparator>Or continue with</FieldSeparator>
					<Field className="grid gap-4 sm:grid-cols-2">
						<Button
							variant="outline"
							type="button"
							disabled={isSubmitting}
							onClick={() => handleSignUp("github")}
						>
							<SiGithub />
							GitHub
						</Button>
						<Button
							variant="outline"
							type="button"
							disabled={isSubmitting}
							onClick={() => handleSignUp("google")}
						>
							<SiGoogle />
							Google
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
}
