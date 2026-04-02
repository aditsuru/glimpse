"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, type SignInSchemaType } from "../schema";
import { authClient } from "@/lib/clients/auth-client";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import InputController from "@/components/form/InputController";

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
							<div className="flex size-8 items-center justify-center rounded-md">
								<Avatar size="lg">
									<AvatarImage
										src="/static/logo.png"
										alt="Glimpse"
										className="grayscale"
									/>
									<AvatarFallback>CN</AvatarFallback>
								</Avatar>
							</div>
							<span className="sr-only">Glimpse</span>
						</Link>

						<h1 className="text-xl font-bold">Welcome to Glimpse</h1>
						<FieldDescription>
							Don&apos;t have an account? <Link href="#">Sign up</Link>
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
					<FieldSeparator>Or</FieldSeparator>
					<Field className="grid gap-4 sm:grid-cols-2">
						<Button variant="outline" type="button">
							Continue with Apple
						</Button>
						<Button variant="outline" type="button">
							Continue with Google
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
