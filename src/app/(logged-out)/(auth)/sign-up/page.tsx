"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
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
import { cn } from "@/lib/client/utils";
import OAuth from "../OAuth";

const FormSchema = z
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

const SignUp = () => {
	const { formState, handleSubmit, control } = useForm<
		z.infer<typeof FormSchema>
	>({
		resolver: zodResolver(FormSchema),
		mode: "onTouched",
		reValidateMode: "onChange",
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleFormSubmit = async (_data: z.infer<typeof FormSchema>) => {
		await new Promise((resolve) => {
			setTimeout(resolve, 3000);
		});
	};

	return (
		<main className="flex flex-col items-center">
			<Avatar className="size-14 after:border-0">
				<AvatarImage src="/static/logo.png" />
				<AvatarFallback className="text-2xl">G</AvatarFallback>
			</Avatar>
			<div className="w-full text-center my-2">
				<h1 className="text-2xl font-bold">Welcome To Glimpse</h1>
				<p
					className={cn("text-muted-foreground mt-2 text-sm", {
						"pointer-events-none text-muted-foreground/60":
							formState.isSubmitting,
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
			</div>
			<FieldGroup>
				<form
					onSubmit={handleSubmit(handleFormSubmit)}
					className={cn("w-full mt-4", {
						"text-muted-foreground/60": formState.isSubmitting,
					})}
				>
					<fieldset disabled={formState.isSubmitting} className="contents">
						<FieldGroup>
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

										<FieldError errors={[fieldState.error]} />
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
												autoComplete="password"
											/>

											<FieldError errors={[fieldState.error]} />
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
												autoComplete="password"
											/>

											<FieldError errors={[fieldState.error]} />
										</Field>
									)}
								/>
							</FieldGroup>
							<Button type="submit" disabled={formState.isSubmitting}>
								{formState.isSubmitting ? <Spinner /> : "Sign In"}
							</Button>
						</FieldGroup>
					</fieldset>
				</form>
				<OAuth disabled={formState.isSubmitting} />
			</FieldGroup>
		</main>
	);
};

export default SignUp;
