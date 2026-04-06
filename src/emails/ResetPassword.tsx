import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	pixelBasedPreset,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

interface GlimpseResetPasswordEmailProps {
	username: string;
	userEmail: string;
	resetPasswordUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const GlimpseResetPasswordEmail = ({
	username,
	userEmail,
	resetPasswordUrl,
}: GlimpseResetPasswordEmailProps) => {
	const previewText = `Reset your Glimpse password`;

	return (
		<Html>
			<Head />
			<Tailwind
				config={{
					presets: [pixelBasedPreset],
				}}
			>
				<Body className="mx-auto my-auto bg-white px-2 font-sans">
					<Preview>{previewText}</Preview>
					<Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
						<Section className="mt-[32px]">
							<Img
								src={`${baseUrl}/static/logo.png`}
								width="40"
								height="37"
								alt="Glimpse Logo"
								className="mx-auto my-0"
							/>
						</Section>
						<Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
							Reset your password for <strong>Glimpse</strong>
						</Heading>
						<Text className="text-[14px] text-black leading-[24px]">
							Hello {username},
						</Text>
						<Text className="text-[14px] text-black leading-[24px]">
							We received a request to reset the password for the{" "}
							<strong>Glimpse</strong> account associated with (
							<Link
								href={`mailto:${userEmail}`}
								className="text-blue-600 no-underline"
							>
								{userEmail}
							</Link>
							). If you made this request, please click the button below to set
							a new password:
						</Text>
						<Section className="mt-[32px] mb-[32px] text-center">
							<Button
								className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
								href={resetPasswordUrl}
							>
								Reset Password
							</Button>
						</Section>
						<Text className="text-[14px] text-black leading-[24px]">
							or copy and paste this URL into your browser:{" "}
							<Link
								href={resetPasswordUrl}
								className="text-blue-600 no-underline"
							>
								{resetPasswordUrl}
							</Link>
						</Text>
						<Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
						<Text className="text-[#666666] text-[12px] leading-[24px]">
							If you didn't request a password reset, you can safely ignore this
							email. Your password will remain unchanged.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

GlimpseResetPasswordEmail.PreviewProps = {
	username: "alanturing",
	userEmail: "alan.turing@example.com",
	resetPasswordUrl: "https://glimpse.app/reset-password?token=123",
} as GlimpseResetPasswordEmailProps;

export default GlimpseResetPasswordEmail;
