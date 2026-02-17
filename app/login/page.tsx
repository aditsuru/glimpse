"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
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
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
	username: z.string().min(6, "Enter a valid length username"),
	password: z.string().nonempty("Password is required"),
});

import Link from "next/link";

type LoginSchema = z.infer<typeof loginSchema>;

function Login() {
	const form = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		mode: "onBlur",
	});

	const handleOnSubmit = async () => {
		await new Promise((res) => {
			setTimeout(res, 2000);
		});
	};

	return (
		<div className="w-full min-h-screen transition-all">
			<div className="flex justify-center items-center h-screen">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center mb-4">
						<CardTitle className="text-2xl">Welcome Back!</CardTitle>
						<CardDescription>
							Enter your credentials to login to your Glimpse account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={form.handleSubmit(handleOnSubmit)}>
							<FieldGroup>
								<FieldGroup className="gap-3">
									<Controller
										name="username"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>Username</FieldLabel>
												<div className="flex items-center relative">
													<User
														className={`absolute w-10 h-6 ${form.formState.isSubmitting ? "opacity-50" : ""}`}
													/>
													<Input
														{...field}
														id={field.name}
														aria-invalid={fieldState.invalid}
														disabled={form.formState.isSubmitting}
														type="text"
														className="pl-10"
													/>
												</div>
												<div className="flex flex-col">
													<AnimatePresence mode="wait">
														{fieldState.invalid && (
															<motion.div
																initial={{
																	opacity: 0,
																	height: 0,
																}}
																animate={{ opacity: 1, height: "auto" }}
																exit={{
																	opacity: 0,
																	height: 0,
																}}
																transition={{ duration: 0.2 }}
															>
																<FieldError errors={[fieldState.error]} />
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											</Field>
										)}
									/>
									<Controller
										name="password"
										control={form.control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<div className="flex items-center justify-between">
													<FieldLabel htmlFor={field.name}>Password</FieldLabel>
													<Link href="/reset-password">
														<FieldDescription className="text">
															Forgot password?
														</FieldDescription>
													</Link>
												</div>
												<div className="flex items-center relative">
													<KeyRound
														className={`absolute w-10 h-6 ${form.formState.isSubmitting ? "opacity-50" : ""}`}
													/>
													<Input
														{...field}
														id={field.name}
														aria-invalid={fieldState.invalid}
														disabled={form.formState.isSubmitting}
														type="password"
														className="pl-10"
													/>
												</div>
												<div className="flex flex-col">
													<AnimatePresence mode="wait">
														{fieldState.invalid && (
															<motion.div
																initial={{
																	opacity: 0,
																	height: 0,
																}}
																animate={{ opacity: 1, height: "auto" }}
																exit={{
																	opacity: 0,
																	height: 0,
																}}
																transition={{ duration: 0.2 }}
															>
																<FieldError errors={[fieldState.error]} />
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											</Field>
										)}
									/>
									<motion.div
										whileTap={{ scale: form.formState.isSubmitting ? 1 : 0.95 }}
										transition={{ type: "spring", stiffness: 400, damping: 20 }}
										className="w-full"
										animate={{
											opacity: form.formState.isSubmitting ? 0.7 : 1,
										}}
									>
										<Button
											type="submit"
											disabled={form.formState.isSubmitting}
											className="font-bold w-full hover:opacity-90"
										>
											{form.formState.isSubmitting && (
												<Loader className="h-4 w-4 animate-spin" />
											)}
											{form.formState.isSubmitting ? "Logging in" : "Login"}
										</Button>
									</motion.div>
								</FieldGroup>
								<FieldSeparator>Or continue with</FieldSeparator>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default Login;
