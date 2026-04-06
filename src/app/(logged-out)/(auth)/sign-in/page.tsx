"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import InputController from "@/components/form/InputController";
import TechStack from "@/components/misc/TechStack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/client/auth-client";
import { cn } from "@/lib/client/utils";
import OAuth from "../OAuth";
import { SignInSchema, type SignInSchemaType } from "../schema";

export default function SignIn() {
	const pageRouter = useRouter();
	const searchParams = useSearchParams();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam) {
			toast.error("Authentication failed. Please try again.");

			pageRouter.replace("/sign-up");
		}
	}, [searchParams, pageRouter]);

	const form = useForm<SignInSchemaType>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const {
		formState: { isSubmitting },
		clearErrors,
	} = form;

	// Submit function
	const handleOnSubmit = async (formData: SignInSchemaType) => {
		const { error, data } = await authClient.signIn.email({
			email: formData.email,
			password: formData.password,
		});

		if (error) {
			form.setError("root", {
				message: error.message ?? "Something went wrong. Please try again.",
			});
			return;
		}

		setIsRedirecting(true);
		if (!data.user.emailVerified) {
			pageRouter.push("/verify-email");
			return;
		}
		pageRouter.push("/");
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
							className={`${isSubmitting || isRedirecting ? "pointer-events-none opacity-50" : ""}`}
						>
							Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
						</FieldDescription>
					</div>
					<FieldGroup onFocusCapture={() => clearErrors("root")}>
						<InputController
							control={form.control}
							name="email"
							type="email"
							formState={form.formState}
							label="Email"
						/>
						<div>
							<InputController
								control={form.control}
								name="password"
								type="password"
								formState={form.formState}
								label="Password"
								labelSideElement={
									<FieldDescription>
										<Link
											href="/forgot-password"
											className={` ${isSubmitting || isRedirecting ? "pointer-events-none opacity-50" : ""}`}
										>
											Forgot password?
										</Link>
									</FieldDescription>
								}
							/>
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
						<Button type="submit" disabled={isSubmitting || isRedirecting}>
							{isSubmitting || isRedirecting ? (
								<div className="flex justify-center items-center gap-2">
									<Spinner className="size-5" />
								</div>
							) : (
								"Sign In"
							)}
						</Button>
					</Field>
					<OAuth
						context="sign-in"
						isSubmitting={isSubmitting || isRedirecting}
					/>
				</FieldGroup>
			</form>
			<TechStack />
		</div>
	);
}
