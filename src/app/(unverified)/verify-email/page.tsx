import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { getRequiredSession } from "@/lib/server/auth-utils";
import { ResendEmailButton } from "./ResendEmailButton";
import SignOutButton from "./SignOutButton";

async function VerifyEmail() {
	const session = await getRequiredSession();
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardContent>
						<FieldGroup>
							<FieldGroup>
								<CardTitle>Verify your email</CardTitle>
								<CardDescription>
									We just sent an email to{" "}
									<span className="text-foreground">{session.user.email}</span>
									<CardDescription>
										Click the link in the email to verify your account.
									</CardDescription>
								</CardDescription>
							</FieldGroup>
							<div className="flex flex-col gap-2">
								<ResendEmailButton />
								<SignOutButton />
							</div>
						</FieldGroup>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default VerifyEmail;
