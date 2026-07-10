"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
				<h1 className="text-2xl font-bold">Terms of Service</h1>
				<p className="text-sm text-muted-foreground">
					Last updated: July 10, 2026
				</p>
			</div>

			<div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
				<Section title="1. About Glimpse">
					<p>
						Glimpse is a personal, independently operated project built and
						maintained by a single developer. It is not a registered company and
						does not offer any formal service-level guarantees. By using
						Glimpse, you acknowledge and accept that it is provided on an as-is,
						best-effort basis.
					</p>
				</Section>

				<Section title="2. Acceptance of Terms">
					<p>
						By creating an account or otherwise accessing Glimpse, you agree to
						be bound by these Terms of Service and our Privacy Policy. If you do
						not agree, please do not use the platform.
					</p>
				</Section>

				<Section title="3. Eligibility">
					<p>
						You must be at least 13 years old to create an account. By
						registering, you confirm that you meet this age requirement and that
						all information you provide is accurate.
					</p>
				</Section>

				<Section title="4. Your Account">
					<p>
						You are responsible for maintaining the confidentiality of your
						account credentials and for all activity that occurs under your
						account. Notify us immediately if you suspect unauthorized access.
					</p>
				</Section>

				<Section title="5. User Content">
					<p>
						You retain ownership of any content you post, upload, or otherwise
						submit to Glimpse ("User Content"). By submitting User Content, you
						grant Glimpse a non-exclusive, worldwide, royalty-free license to
						host, store, display, and distribute that content solely for the
						purpose of operating and providing the platform.
					</p>
					<p>
						You are solely responsible for the content you post. You represent
						that you have all necessary rights to post it and that it does not
						infringe on the rights of any third party.
					</p>
				</Section>

				<Section title="6. Prohibited Conduct">
					<p>
						You agree not to use Glimpse to post or distribute content that is
						illegal, hateful, harassing, sexually explicit involving minors,
						infringing, or otherwise in violation of these Terms or our{" "}
						<a
							href="/legal/guidelines"
							className="underline hover:text-primary"
						>
							Community Guidelines
						</a>
						. A full list of prohibited behavior and how we enforce it is
						detailed there.
					</p>
				</Section>

				<Section title="7. Moderation, Suspension, and Termination">
					<p>
						We reserve the right to remove content, issue warnings, suspend
						accounts temporarily, or permanently ban accounts that violate these
						Terms or our Community Guidelines, at our sole discretion.
					</p>
					<p>
						A permanent ban results in the deletion of your account and all
						associated content. A temporary suspension restricts your ability to
						access the platform for a defined period without deleting your
						content. We may notify you of moderation actions taken against your
						account or content.
					</p>
				</Section>

				<Section title="8. Copyright (DMCA)">
					<p>
						If you believe content on Glimpse infringes your copyright, please
						submit a notice through our{" "}
						<a href="/legal/dmca" className="underline hover:text-primary">
							DMCA takedown process
						</a>
						. We respond to valid, properly-formed notices and may remove
						infringing content and take action against repeat infringers.
					</p>
				</Section>

				<Section title="9. Disclaimer of Warranties">
					<p>
						Glimpse is provided "as is" and "as available" without warranties of
						any kind, whether express or implied. We do not guarantee that the
						service will be uninterrupted, secure, or error-free.
					</p>
				</Section>

				<Section title="10. Limitation of Liability">
					<p>
						To the fullest extent permitted by law, Glimpse and its operator
						shall not be liable for any indirect, incidental, or consequential
						damages arising from your use of the platform, including loss of
						data or content.
					</p>
				</Section>

				<Section title="11. Changes to These Terms">
					<p>
						We may update these Terms from time to time. Continued use of
						Glimpse after changes are posted constitutes acceptance of the
						updated Terms.
					</p>
				</Section>

				<Section title="12. Governing Law">
					<p>
						These Terms are governed by the laws of India, without regard to its
						conflict of law principles.
					</p>
				</Section>

				<Section title="13. Contact">
					<p>
						For any questions about these Terms, contact us at{" "}
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
