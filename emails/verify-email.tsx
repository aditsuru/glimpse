import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface GlimpseVerifyEmailProps {
	userName: string;
	verificationUrl: string;
}
const theme = {
	background: "#fdf2f8",
	foreground: "#881337",
	card: "#fff7fa",
	primary: "#e11d48",
	muted: "#9f1239",
	radius: "8px",
	fontSans: "'Poppins', 'HelveticaNeue', Helvetica, Arial, sans-serif",
};

export const GlimpseVerifyEmail = ({
	userName,
	verificationUrl,
}: GlimpseVerifyEmailProps) => (
	<Html>
		<Head />
		<Preview>Verify your account on Glimpse</Preview>
		<Body style={main}>
			<Container style={container}>
				<Section style={logoContainer}>
					<Heading style={logoText}>Glimpse</Heading>
				</Section>

				<Section style={card}>
					<Heading style={h1}>Welcome to the community!</Heading>
					<Text style={text}>Hi {userName},</Text>
					<Text style={text}>
						We're thrilled to have you on <strong>Glimpse</strong>. Before you
						start sharing your moments, we just need to verify that this email
						address belongs to you.
					</Text>

					<Section style={btnContainer}>
						<Button style={button} href={verificationUrl}>
							Verify My Account
						</Button>
					</Section>

					<Text style={text}>
						Or copy and paste this URL into your browser:
					</Text>
					<Link href={verificationUrl} style={link}>
						{verificationUrl}
					</Link>

					<Hr style={hr} />

					<Text style={footerText}>
						If you didn't create an account on Glimpse, you can safely ignore
						this email.
					</Text>
				</Section>

				<Section style={footer}>
					<Text style={footerLinks}>
						<Link
							href="https://glimpse.aditsuru.com/privacy"
							style={footerLink}
						>
							Privacy Policy
						</Link>{" "}
						•{" "}
						<Link href="https://glimpse.aditsuru.com/terms" style={footerLink}>
							Terms of Service
						</Link>
					</Text>
					<Text style={copyright}>
						© 2026 Glimpse Social. All rights reserved.
					</Text>
				</Section>
			</Container>
		</Body>
	</Html>
);

export default GlimpseVerifyEmail;

const main = {
	backgroundColor: theme.background,
	fontFamily: theme.fontSans,
	padding: "40px 0",
};

const container = {
	margin: "0 auto",
	width: "580px",
	maxWidth: "100%",
};

const logoContainer = {
	textAlign: "center" as const,
	marginBottom: "30px",
};

const logoText = {
	fontSize: "32px",
	fontWeight: "700",
	color: theme.primary,
	letterSpacing: "-0.05em",
	margin: "0",
};

const card = {
	backgroundColor: "#ffffff",
	border: `1px solid #fce7f3`,
	borderRadius: theme.radius,
	padding: "40px",
	boxShadow: "0 4px 6px -1px rgba(136, 19, 55, 0.1)",
};

const h1 = {
	color: theme.foreground,
	fontFamily: theme.fontSans,
	fontSize: "24px",
	fontWeight: "600",
	lineHeight: "1.3",
	margin: "0 0 20px",
};

const text = {
	color: theme.foreground,
	fontSize: "16px",
	lineHeight: "24px",
	textAlign: "left" as const,
};

const btnContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: theme.primary,
	borderRadius: theme.radius,
	color: "#fff",
	fontSize: "16px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "12px 24px",
};

const link = {
	color: theme.primary,
	fontSize: "14px",
	textDecoration: "underline",
};

const hr = {
	borderColor: "#fce7f3",
	margin: "30px 0",
};

const footer = {
	textAlign: "center" as const,
	marginTop: "30px",
};

const footerText = {
	color: theme.muted,
	fontSize: "14px",
	lineHeight: "20px",
};

const footerLinks = {
	color: theme.muted,
	fontSize: "12px",
};

const footerLink = {
	color: theme.muted,
	textDecoration: "underline",
};

const copyright = {
	color: theme.muted,
	fontSize: "11px",
	marginTop: "12px",
};
