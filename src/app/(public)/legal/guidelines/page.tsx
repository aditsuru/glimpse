"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CommunityGuidelinesPage() {
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
				<h1 className="text-2xl font-bold">Community Guidelines</h1>
				<p className="text-sm text-muted-foreground">
					Last updated: July 10, 2026
				</p>
			</div>

			<div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
				<Section title="Our Approach">
					<p>
						Glimpse is meant to be a space people enjoy using. These guidelines
						exist to keep it that way. They apply to everything you post — text,
						images, videos, comments, and your profile itself.
					</p>
				</Section>

				<Section title="Spam">
					<p>
						Don't post repetitive, unsolicited, or automated content. This
						includes mass-following, fake engagement, and content designed
						purely to manipulate reach.
					</p>
				</Section>

				<Section title="NSFW & Explicit Content">
					<p>
						Sexually explicit content, and any content sexualizing minors in any
						way, is strictly prohibited and will result in an immediate
						permanent ban and, where applicable, be reported to the relevant
						authorities.
					</p>
				</Section>

				<Section title="Harassment & Bullying">
					<p>
						Don't target other users with abuse, threats, unwanted contact, or
						behavior intended to degrade or intimidate them.
					</p>
				</Section>

				<Section title="Hate Speech">
					<p>
						Content that attacks or demeans people based on race, ethnicity,
						religion, gender, sexual orientation, disability, or similar
						characteristics is not allowed.
					</p>
				</Section>

				<Section title="Self-Harm & Suicide">
					<p>
						Content that promotes, glorifies, or provides instructions for
						self-harm or suicide is not allowed. If you or someone you know is
						struggling, please reach out to a local crisis line or a trusted
						person for support.
					</p>
				</Section>

				<Section title="Misinformation">
					<p>
						Don't knowingly spread false information intended to deceive or
						cause harm, particularly around health, safety, or civic processes.
					</p>
				</Section>

				<Section title="Copyright">
					<p>
						Don't post content you don't have the rights to. If you believe
						someone has posted your copyrighted work without permission, use our{" "}
						<a href="/legal/dmca" className="underline hover:text-primary">
							DMCA process
						</a>{" "}
						to request its removal.
					</p>
				</Section>

				<Section title="How Reports Work">
					<p>
						Any user can report a post, comment, or profile. Reports are
						reviewed by our moderation team, and you'll be notified of the
						outcome once your report is resolved.
					</p>
				</Section>

				<Section title="Enforcement">
					<p>Depending on the severity and context of a violation, we may:</p>
					<ul className="list-disc pl-6 flex flex-col gap-1">
						<li>Remove the specific content in violation</li>
						<li>
							Temporarily suspend an account, restricting access while leaving
							existing content visible
						</li>
						<li>
							Permanently ban an account, which deletes the account and all
							associated content and prevents re-registration with the same
							email
						</li>
					</ul>
					<p>
						Severe or repeated violations, particularly involving the safety of
						minors, may result in an immediate permanent ban without prior
						warning.
					</p>
				</Section>

				<Section title="Questions">
					<p>
						If you have questions about these guidelines or believe a moderation
						decision was made in error, contact us at{" "}
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
