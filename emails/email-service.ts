import "server-only";
import { Resend } from "resend";
import { GlimpseVerifyEmail } from "@/emails/verify-email";
import { config } from "@/lib/config";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendVerificationEmail({
	to,
	name,
	url,
}: {
	to: string;
	name: string;
	url: string;
}) {
	await resend.emails.send({
		from: "Glimpse <noreply@aditsuru.com>",
		to,
		subject: "Verify your Glimpse account",
		react: GlimpseVerifyEmail({ verificationUrl: url, userName: name }),
	});
}
