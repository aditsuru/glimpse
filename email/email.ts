import "server-only";
import { Resend } from "resend";
import { GlimpseVerifyEmail } from "@/email/VerifyEmail";
import { config } from "@/lib/config";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendVerificationEmail({
	to,
	username,
	verificationUrl,
}: {
	to: string;
	username: string;
	verificationUrl: string;
}) {
	await resend.emails.send({
		from: "Glimpse <noreply@aditsuru.com>",
		to,
		subject: "Verify your Glimpse account",
		react: GlimpseVerifyEmail({ verificationUrl, username, userEmail: to }),
	});
}
