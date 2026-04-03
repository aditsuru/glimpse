import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { CooldownButton } from "@/components/form/CooldownButton";
import InputController from "@/components/form/InputController";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { useCooldown } from "@/hooks/useCooldown";
import { authClient } from "@/lib/clients/auth-client";
import { config } from "@/lib/config";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

const EmailSchema = z.object({
	email: z.email("Email must be valid"),
});
type EmailSchemaType = z.infer<typeof EmailSchema>;

function ForgotPassword() {
	const form = useForm<EmailSchemaType>({
		resolver: zodResolver(EmailSchema),
		defaultValues: {
			email: "",
		},
		mode: "onTouched",
		reValidateMode: "onChange",
	});

	const { clearErrors } = form;

	const { secondsLeft, startCooldown } = useCooldown(
		LOCAL_STORAGE_KEYS.FORGOT_PASSWORD_COOLDOWN,
		config.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT
	);

	// Handle Submit
	const handleOnSubmit = async (values: EmailSchemaType) => {
		const { error } = await authClient.requestPasswordReset({
			email: values.email,
			redirectTo: "/reset-password",
		});

		if (error) {
			form.setError("root", { message: error.message });
			return;
		}

		startCooldown();
		toast.success("Reset link sent!");
	};

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<Card>
					<CardContent>
						<FieldGroup>
							<FieldGroup>
								<CardTitle>Request Password Reset</CardTitle>
								<form onSubmit={form.handleSubmit(handleOnSubmit)}>
									<FieldGroup onFocusCapture={() => clearErrors("root")}>
										<InputController
											control={form.control}
											name="email"
											type="email"
											formState={form.formState}
											label="Email"
										/>
										<div>
											<FieldError errors={[form.formState.errors.root]} />
										</div>
									</FieldGroup>
									<Field>
										<CooldownButton
											label="Send Password Reset Email"
											secondsLeft={secondsLeft}
											isSubmitting={form.formState.isSubmitting}
										/>
									</Field>
								</form>
							</FieldGroup>
						</FieldGroup>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default ForgotPassword;
