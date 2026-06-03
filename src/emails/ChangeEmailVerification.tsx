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

interface GlimpseChangeEmailConfirmationProps {
	userEmail: string;
	newEmail: string;
	verificationUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const GlimpseChangeEmailConfirmation = ({
	userEmail,
	newEmail,
	verificationUrl,
}: GlimpseChangeEmailConfirmationProps) => {
	const previewText = `Approve your email change on Glimpse`;

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
							Approve email change on{" "}
							<strong className="text-primary">Glimpse</strong>
						</Heading>
						<Text className="text-[14px] text-black leading-[24px]">
							Hello,
						</Text>
						<Text className="text-[14px] text-black leading-[24px]">
							A request was made to change the email address on your{" "}
							<strong>Glimpse</strong> account from{" "}
							<Link
								href={`mailto:${userEmail}`}
								className="text-blue-600 no-underline"
							>
								{userEmail}
							</Link>{" "}
							to{" "}
							<Link
								href={`mailto:${newEmail}`}
								className="text-blue-600 no-underline"
							>
								{newEmail}
							</Link>
							. Click below to approve this change.
						</Text>
						<Section className="mt-[32px] mb-[32px] text-center">
							<Button
								className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
								href={verificationUrl}
							>
								Approve Email Change
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
							If you didn&apos;t request this change, you can safely ignore this
							email. Your email address will remain unchanged.
						</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

GlimpseChangeEmailConfirmation.PreviewProps = {
	userEmail: "alan.turing@example.com",
	newEmail: "alan.new@example.com",
	verificationUrl: "https://glimpse.app/approve-email-change",
} as GlimpseChangeEmailConfirmationProps;

export default GlimpseChangeEmailConfirmation;
