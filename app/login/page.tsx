"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

const loginSchema = z.object({
	username: z.string().min(6, "Enter a valid length username"),
	password: z.string().nonempty("Password is required"),
});

import Link from "next/link";
import ControllerInput from "@/components/form/ControllerInput";
import FormButton from "@/components/form/FormButton";

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
									<ControllerInput
										control={form.control}
										name="username"
										label="Username"
										Icon={User}
									/>
									<div>
										<ControllerInput
											control={form.control}
											name="password"
											label="Password"
											Icon={KeyRound}
											type="password"
											labelRight={
												<FieldDescription>
													<Link href="/reset-password" className="text-sm">
														Forgot password?
													</Link>
												</FieldDescription>
											}
										/>
									</div>
									<FormButton
										form={form}
										idleText="Login"
										submittingText="Logging in"
									/>
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
