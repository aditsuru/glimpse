"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	AtIcon,
	GithubIcon,
	GoogleIcon,
	Mail02Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ORPCError } from "@orpc/client";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { type SignupSchemaType, signupSchema } from "@/app/(auth)/schema";
import InputController from "@/components/form/InputController";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/clients/orpc-client";
import { useMutation } from "@/lib/core/hooks/useMutation";

function SignUpForm() {
	// Page router for redirect
	const pageRouter = useRouter();

	// React form handling
	const form = useForm<SignupSchemaType>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const {
		formState: { isSubmitting },
	} = form;

	// Mutation query
	const { mutateAsync } = useMutation(client.user.signUp, {
		onSuccess: () => {
			pageRouter.push("/");
		},
	});

	// Submit function
	const handleOnSubmit = async (data: SignupSchemaType) => {
		const { confirmPassword, ...rest } = data;
		try {
			await mutateAsync(rest);
		} catch (error) {
			if (error instanceof ORPCError) {
				form.setError("root", {
					message: error.message ?? "Something went wrong. Please try again.",
				});
			} else {
				form.setError("root", {
					message: "Something went wrong. Please try again.",
				});
			}
		}
	};

	return (
		<Card className="w-sm md:w-full max-w-lg p-4 py-6">
			<FieldGroup>
				<CardHeader className="text-center m-2">
					<CardTitle className="flex items-center justify-center gap-2 text-2xl">
						Create Your
						<span className="text-primary">Glimpse</span>
						Account
						<ThemeToggle />
					</CardTitle>
					<CardDescription className="">
						Enter your credentials to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(handleOnSubmit)}>
						<FieldGroup>
							<InputController
								control={form.control}
								name="name"
								type="text"
								formState={form.formState}
								label="Your Name"
								InputIcon={{
									icon: UserIcon,
									className: "size-6!",
								}}
							/>
							<InputController
								control={form.control}
								name="username"
								type="text"
								formState={form.formState}
								label="Username"
								InputIcon={{
									icon: AtIcon,
									className: "size-6!",
								}}
							/>
							<InputController
								control={form.control}
								name="email"
								type="email"
								formState={form.formState}
								label="Email"
								InputIcon={{
									icon: Mail02Icon,
									className: "size-6!",
								}}
							/>
							<FieldGroup className="flex-row">
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
							</FieldGroup>

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
										className="overflow-hidden"
									>
										<div>
											<FieldError errors={[form.formState.errors.root]} />
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							<motion.div
								whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 20 }}
								className="w-full"
								animate={{ opacity: isSubmitting ? 0.7 : 1 }}
							>
								<Button
									className="w-full hover:opacity-90 font-bold cursor-none"
									type="submit"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<div className="flex justify-center items-center gap-2">
											<Spinner className="size-5" />
										</div>
									) : (
										"Sign up"
									)}
								</Button>
							</motion.div>
						</FieldGroup>
					</form>
					<FieldSeparator className={`m-4 ${isSubmitting ? "opacity-50" : ""}`}>
						Or continue with
					</FieldSeparator>
					<FieldGroup className="gap-4">
						<FieldGroup className="w-full flex md:flex-row gap-y-3">
							<Button
								variant="outline"
								className="flex-1 transition-all hover:scale-110 duration-125 cursor-none"
								disabled={isSubmitting}
							>
								<HugeiconsIcon icon={GithubIcon} className="size-5!" />
								GitHub
							</Button>
							<Button
								variant="outline"
								className="flex-1 transition-all hover:scale-110 duration-125 cursor-none"
								disabled={isSubmitting}
							>
								<HugeiconsIcon icon={GoogleIcon} className="size-5!" />
								<p>Google</p>
							</Button>
						</FieldGroup>
						<FieldDescription
							className={`flex justify-center gap-1  ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
						>
							Already have an account?{" "}
							<Link href="/sign-in" className="cursor-none">
								Sign In here
							</Link>
						</FieldDescription>
					</FieldGroup>
				</CardContent>
			</FieldGroup>
		</Card>
	);
}

export default SignUpForm;
