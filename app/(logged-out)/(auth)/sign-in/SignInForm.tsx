"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import InputController from "@/components/form/InputController";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";
import { authClient } from "@/lib/clients/auth-client";
import { cn } from "@/lib/utils";
import { SignInSchema, type SignInSchemaType } from "../schema";
import { GithubIcon, GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function SignInForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const pageRouter = useRouter();

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

		if (!data.user.emailVerified) pageRouter.push("/verify-email");
		pageRouter.push("/");
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
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
						<FieldDescription>
							Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
						</FieldDescription>
					</div>
					<InputController
						control={form.control}
						name="email"
						type="email"
						formState={form.formState}
						label="Email"
					/>
					<InputController
						control={form.control}
						name="password"
						type="password"
						formState={form.formState}
						label="Password"
						labelSideElement={
							<FieldDescription>
								<Link
									href="/reset-password"
									className={` ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
								>
									Forgot password?
								</Link>
							</FieldDescription>
						}
					/>
					<Field>
						<Button type="submit">Sign In</Button>
					</Field>
					<FieldSeparator>Or continue with</FieldSeparator>
					<Field className="grid gap-4 sm:grid-cols-2">
						<Button variant="outline" type="button">
							<HugeiconsIcon icon={GithubIcon} />
							GitHub
						</Button>
						<Button variant="outline" type="button">
							<HugeiconsIcon icon={GoogleIcon} />
							Google
						</Button>
					</Field>
				</FieldGroup>
			</form>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<Link href="#">Terms of Service</Link> and{" "}
				<Link href="#">Privacy Policy</Link>.
			</FieldDescription>
		</div>
	);
}
