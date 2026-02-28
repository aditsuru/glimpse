"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, KeyRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { SignInSchema, type SignInSchemaType } from "@/app/(auth)/schema";
import InputController from "@/components/form/InputController";
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
	FieldError,
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

function SignInForm() {
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

	const handleOnSubmit = async () => {
		await new Promise((res) => setTimeout(res, 2000));
	};
	return (
		<Card className="w-sm md:w-full max-w-lg p-4 py-6">
			<FieldGroup>
				<CardHeader className="text-center m-2">
					<CardTitle className="text-2xl">Welcome Back</CardTitle>
					<CardDescription className="">
						Enter your credentials to Sign In to your{" "}
						<span className="text-primary">Glimpse</span> account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(handleOnSubmit)}>
						<FieldGroup>
							<InputController
								control={form.control}
								name="email"
								type="email"
								formState={form.formState}
								label="Email"
								InputIcon={AtSign}
							/>

							<InputController
								control={form.control}
								name="password"
								type="password"
								formState={form.formState}
								label="Password"
								InputIcon={KeyRound}
								labelSideElement={
									<FieldDescription>
										<Link
											href="/reset-password"
											className={`cursor-none ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
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
										"Sign In"
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
						<FieldDescription
							className={`flex justify-center gap-1  ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
						>
							Don't have an account?{" "}
							<Link href="/sign-up" className={"cursor-none"}>
								Sign up here
							</Link>
						</FieldDescription>
					</FieldGroup>
				</CardContent>
			</FieldGroup>
		</Card>
	);
}

export default SignInForm;
