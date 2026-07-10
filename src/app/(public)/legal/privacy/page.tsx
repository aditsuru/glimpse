"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
	const router = useRouter();

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 flex flex-col gap-8">
			<div>
				<Button
					variant="ghost"
					className="px-0 hover:bg-transparent! hover:underline underline-offset-4"
					onClick={() => {
						router.back();
					}}
				>
					<ChevronLeft /> Go Back
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Privacy Policy</h1>
				<p className="text-sm text-muted-foreground">
					Last updated: July 10, 2026
				</p>
			</div>

			<div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
				<Section title="1. Overview">
					<p>
						This Privacy Policy explains what information Glimpse collects, how
						it's used, and the choices you have. Glimpse is an independently
						operated personal project, not a company, and this policy reflects
						that context.
					</p>
				</Section>

				<Section title="2. Information We Collect">
					<p>When you use Glimpse, we collect:</p>
					<ul className="list-disc pl-6 flex flex-col gap-1">
						<li>
							<span className="text-foreground font-medium">
								Account information
							</span>{" "}
							— email address, username, display name, and password (stored as a
							secure hash, never in plain text).
						</li>
						<li>
							<span className="text-foreground font-medium">
								Profile content
							</span>{" "}
							— avatar, banner, bio, and pronouns you choose to add.
						</li>
						<li>
							<span className="text-foreground font-medium">User content</span>{" "}
							— posts, comments, likes, bookmarks, and follow relationships you
							create.
						</li>
						<li>
							<span className="text-foreground font-medium">Usage data</span> —
							which posts you've viewed, used to power your feed and avoid
							duplicate content.
						</li>
						<li>
							<span className="text-foreground font-medium">
								Technical data
							</span>{" "}
							— IP address, used for rate limiting and abuse prevention.
						</li>
						<li>
							<span className="text-foreground font-medium">OAuth data</span> —
							if you sign in via a third-party provider (e.g. Google), we
							receive basic profile information (email, name) as authorized by
							that provider.
						</li>
					</ul>
				</Section>

				<Section title="3. How We Use Your Information">
					<p>We use the information we collect to:</p>
					<ul className="list-disc pl-6 flex flex-col gap-1">
						<li>Operate and maintain your account and the platform</li>
						<li>
							Display your content to other users as intended by the platform's
							functionality
						</li>
						<li>Personalize your feed and prevent duplicate content</li>
						<li>
							Detect, prevent, and respond to abuse, spam, or violations of our
							Terms
						</li>
						<li>
							Communicate with you about your account or moderation actions
						</li>
					</ul>
				</Section>

				<Section title="4. Cookies & Sessions">
					<p>
						Glimpse uses a session cookie to keep you signed in. This cookie is
						essential to the functioning of the service and is not used for
						advertising or third-party tracking.
					</p>
				</Section>

				<Section title="5. Third-Party Service Providers">
					<p>
						To operate Glimpse, we rely on third-party infrastructure providers
						to store and process data on our behalf, including database hosting,
						caching/queueing infrastructure, object storage for images and
						videos, and application hosting. These providers only process data
						as necessary to provide their services to us and are bound by their
						own privacy and security practices.
					</p>
				</Section>

				<Section title="6. Data Retention">
					<p>
						We retain your account and content for as long as your account is
						active. If your account is permanently banned or you delete your
						account, your data is deleted, with the exception of information we
						are required to retain for legal or safety purposes (e.g. records
						related to a ban, to prevent re-registration by the same
						individual).
					</p>
				</Section>

				<Section title="7. Your Rights">
					<p>
						You can update or delete most of your profile information directly
						within the app. To request full account deletion or ask questions
						about your data, contact us at the email below.
					</p>
				</Section>

				<Section title="8. Children's Privacy">
					<p>
						Glimpse is not intended for children under 13. We do not knowingly
						collect personal information from children under 13. If you believe
						a child under 13 has created an account, please contact us so we can
						take appropriate action.
					</p>
				</Section>

				<Section title="9. Changes to This Policy">
					<p>
						We may update this Privacy Policy from time to time. Continued use
						of Glimpse after changes are posted constitutes acceptance of the
						updated policy.
					</p>
				</Section>

				<Section title="10. Contact">
					<p>
						For privacy-related questions or requests, contact us at{" "}
						<a
							href="mailto:legal@aditsuru.com"
							className="underline hover:text-primary"
						>
							legal@aditsuru.com
						</a>
						.
					</p>
				</Section>
			</div>
		</div>
	);
}

const Section = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<div className="flex flex-col gap-2">
		<h2 className="text-lg font-semibold text-foreground">{title}</h2>
		{children}
	</div>
);
