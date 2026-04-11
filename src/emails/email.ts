import { Resend } from "resend";
import { GlimpseVerifyEmail } from "@/emails/VerifyEmail";
import { config } from "@/lib/shared/config";
import GlimpseResetPasswordEmail from "./ResetPassword";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendVerificationEmail({
	to,
	verificationUrl,
}: {
	to: string;
	verificationUrl: string;
}) {
	await resend.emails.send({
		from: "Glimpse <noreply@aditsuru.com>",
		to,
		subject: "Verify your Glimpse account",
		react: GlimpseVerifyEmail({ verificationUrl, userEmail: to }),
	});
}

export async function sendResetPasswordEmail({
	to,
	username,
	resetPasswordUrl,
}: {
	to: string;
	username: string;
	resetPasswordUrl: string;
}) {
	await resend.emails.send({
		from: "Glimpse <noreply@aditsuru.com>",
		to,
		subject: "Verify your Glimpse account",
		react: GlimpseResetPasswordEmail({
			resetPasswordUrl,
			username,
			userEmail: to,
		}),
	});
}
