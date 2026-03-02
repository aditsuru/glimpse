import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { auth } from "@/lib/auth";

async function VerifyEmail() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) redirect("/sign-in");
	if (session.user.emailVerified) redirect("/");

	return (
		<div className="flex flex-col justify-center items-center w-full h-screen gap-6 text-center">
			<Card className="w-md md:w-full max-w-2xl py-14 shadow-none border-0">
				<FieldGroup>
					<CardHeader>
						<CardTitle className="text-3xl flex items-center justify-center gap-2">
							<HugeiconsIcon icon={Mail01Icon} size={42} />
							Verify your email
						</CardTitle>
					</CardHeader>
					<CardContent>
						<FieldGroup className="flex justify-center items-center">
							<div>
								<CardDescription className="text-xl">
									We just sent an email to{" "}
									<span className="text-primary">{session.user.email}</span>
								</CardDescription>
								<CardDescription className="text-xl">
									Click the link in the email to verify your account
								</CardDescription>
							</div>
							<div className="w-full px-4 md:px-14">
								<Button className="hover:opacity-90 w-full cursor-none font-bold">
									Resent Verification Email
								</Button>
							</div>
						</FieldGroup>
					</CardContent>
				</FieldGroup>
			</Card>
		</div>
	);
}

export default VerifyEmail;
