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

interface GlimpseVerifyEmailProps {
	userEmail: string;
	verificationUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const GlimpseVerifyEmail = ({
	userEmail,
	verificationUrl,
}: GlimpseVerifyEmailProps) => {
	const previewText = `Verify your account on Glimpse`;

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
								width="80"
								height="80"
								alt="Glimpse Logo"
								className="mx-auto my-0"
							/>
						</Section>
						<Heading className="mx-0 my-[30px] p-0 text-center font-semibold text-[24px] text-black">
							Verify your account on{" "}
							<strong className="text-primary">Glimpse</strong>
						</Heading>
						<Text className="text-[14px] text-black leading-[24px]">
							Hello,
						</Text>
						<Text className="text-[14px] text-black leading-[24px]">
							We're thrilled to have you on <strong>Glimpse</strong>. Before you
							start sharing your moments, we just need to verify that this email
							address (
							<Link
								href={`mailto:${userEmail}`}
								className="text-blue-600 no-underline"
							>
								{userEmail}
							</Link>
							) belongs to you.
						</Text>
						<Section className="mt-[32px] mb-[32px] text-center">
							<Button
								className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
								href={verificationUrl}
							>
								Verify My Account
							</Button>
						</Section>
						<Text className="text-[14px] text-black leading-[24px]">
							or copy and paste this URL into your browser:{" "}
							<Link
								href={verificationUrl}
								className="text-blue-600 no-underline"
							>
								{verificationUrl}
							</Link>
						</Text>
						<Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
						<Text className="text-[#666666] text-[12px] leading-[24px]">
							If you didn't create an account on Glimpse, you can safely ignore
							this email.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

GlimpseVerifyEmail.PreviewProps = {
	userEmail: "alan.turing@example.com",
	verificationUrl: "https://glimpse.app/verify",
} as GlimpseVerifyEmailProps;

export default GlimpseVerifyEmail;
