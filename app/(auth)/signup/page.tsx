"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IdCard, KeyRound, Loader, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import InputController from "@/components/form/InputController";
import { type SignupSchemaType, signupSchema } from "@/components/form/schemas";
import { GitHub, Google } from "@/components/icons/Index";
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
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";

function Login() {
	const form = useForm<SignupSchemaType>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: "",
			username: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onBlur",
		reValidateMode: "onChange",
	});

	const {
		formState: { isSubmitting },
	} = form;

	const handleOnSubmit = async () => {
		await new Promise((res) => setTimeout(res, 2000));
	};

	return (
		<div className="flex justify-center items-center w-full h-screen">
			<Card className="w-sm md:w-full max-w-lg p-4 py-6">
				<FieldGroup>
					<CardHeader className="text-center m-2">
						<CardTitle className="text-2xl">
							Create Your <span className="text-primary">Glimpse</span> Account
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
									InputIcon={IdCard}
								/>
								<InputController
									control={form.control}
									name="username"
									type="text"
									formState={form.formState}
									label="Username"
									InputIcon={User}
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
												<Loader className="animate-spin" />
												<p>Signing up</p>
											</div>
										) : (
											"Signup"
										)}
									</Button>
								</motion.div>
							</FieldGroup>
						</form>
						<FieldSeparator className="m-4">Or continue with</FieldSeparator>
						<FieldGroup className="gap-4">
							<FieldGroup className="w-full flex md:flex-row gap-y-3">
								<Button
									variant="outline"
									className="flex-1 transition-all hover:scale-110 duration-125 cursor-none"
									disabled={isSubmitting}
								>
									<GitHub />
									GitHub
								</Button>
								<Button
									variant="outline"
									className="flex-1 transition-all hover:scale-110 duration-125 cursor-none"
									disabled={isSubmitting}
								>
									<Google />
									<p>Google</p>
								</Button>
							</FieldGroup>
							<FieldDescription className="flex justify-center gap-1">
								Already have an account?{" "}
								<Link href="/login" className="cursor-none">
									Login here
								</Link>
							</FieldDescription>
						</FieldGroup>
					</CardContent>
				</FieldGroup>
			</Card>
		</div>
	);
}

export default Login;
