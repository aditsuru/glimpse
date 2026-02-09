"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const formFieldSchema = z.object({
	email: z.email("Please enter a valid email address"),

	password: z.string().min(8, "Password must be at least 8 characters long").max(32, "Password is too long"),
});

type FormFields = z.infer<typeof formFieldSchema>;

export default function LoginForm() {
	const {
		register,
		handleSubmit,
		setError,
		formState: { isSubmitting, errors },
	} = useForm<FormFields>({
		resolver: zodResolver(formFieldSchema),
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const onSubmit: SubmitHandler<FormFields> = async (data) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			throw new Error();
			console.log(data);
		} catch (_error) {
			setError("root", {
				message: "This email is already taken",
			});
		}
	};

	return (
		<form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
			<FieldGroup>
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Welcome back</h1>
					<p className="text-muted-foreground text-balance">Login to your Glimpse account</p>
				</div>
				<Field>
					<FieldLabel htmlFor="email" className="cursor-none">
						Email
					</FieldLabel>
					<Input
						{...register("email")}
						id="email"
						type="email"
						placeholder="adi@example.com"
						required
						className="cursor-none"
					/>
					{errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
				</Field>
				<Field>
					<div className="flex items-center">
						<FieldLabel htmlFor="password" className="cursor-none">
							Password
						</FieldLabel>
						<Link href="/password-reset" className="ml-auto text-sm underline-offset-2 hover:underline cursor-none">
							Forgot your password?
						</Link>
					</div>
					<Input {...register("password")} id="password" type="password" required className="cursor-none" />
					{errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
				</Field>
				<Field>
					{errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}
					<Button disabled={isSubmitting} type="submit" className="cursor-none hover:brightness-95">
						Login
					</Button>
				</Field>
				<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>
				<Field className="grid grid-cols-3 gap-4">
					<Button variant="outline" type="button" className="cursor-none">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M19.27 4.57c-1.3-.6-2.69-1.04-4.15-1.3a.05.05 0 0 0-.05.02c-.18.33-.39.75-.53 1.09a13.3 13.3 0 0 0-3.95 0c-.14-.34-.35-.76-.54-1.09a.05.05 0 0 0-.05-.02c-1.46.26-2.85.7-4.15 1.3a.05.05 0 0 0-.02.02C3.21 8.58 2.4 12.47 2.77 16.32a.05.05 0 0 0 .02.03c1.7 1.25 3.35 2.02 4.97 2.52a.05.05 0 0 0 .06-.02c.39-.53.73-1.1 1.02-1.69a.05.05 0 0 0-.03-.07c-.53-.2-1.04-.45-1.52-.74a.05.05 0 0 1-.01-.08c.11-.08.21-.17.31-.25a.05.05 0 0 1 .05-.01c3.27 1.5 6.81 1.5 10.03 0a.05.05 0 0 1 .05.01c.1.08.2.17.31.25a.05.05 0 0 1-.01.08c-.48.29-1 .54-1.53.74a.05.05 0 0 0-.03.07c.29.59.63 1.16 1.02 1.69a.05.05 0 0 0 .06.02c1.62-.5 3.27-1.27 4.97-2.52a.05.05 0 0 0 .02-.03c.45-4.43-.75-8.25-2.92-11.73a.05.05 0 0 0-.02-.02zM8.52 14.22c-.93 0-1.7-.86-1.7-1.92s.75-1.92 1.7-1.92s1.71.86 1.71 1.92s-.77 1.92-1.71 1.92zm6.96 0c-.93 0-1.7-.86-1.7-1.92s.75-1.92 1.7-1.92s1.71.86 1.71 1.92s-.78 1.92-1.71 1.92z"
							/>
						</svg>
						<span className="sr-only">Login with Discord</span>
					</Button>
					<Button variant="outline" type="button" className="cursor-none">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						<span className="sr-only">Login with Google</span>
					</Button>
					<Button variant="outline" type="button" className="cursor-none">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
							/>
						</svg>
						<span className="sr-only">Login with GitHub</span>
					</Button>
				</Field>
				<FieldDescription className="text-center">
					Don&apos;t have an account?{" "}
					<Link href="/signup" className="cursor-none">
						Sign up
					</Link>
				</FieldDescription>
			</FieldGroup>
		</form>
	);
}
