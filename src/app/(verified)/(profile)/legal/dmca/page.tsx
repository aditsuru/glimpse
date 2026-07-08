"use client";

import { useState } from "react";
import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDmcaRequest } from "@/modules/dmca/dmca.queries";

export default function DmcaPage() {
	const createDmca = useCreateDmcaRequest();

	const [form, setForm] = useState({
		fullName: "",
		email: "",
		address: "",
		phone: "",
		copyrightedWorkDescription: "",
		infringingUrl: "",
		additionalContext: "",
		goodFaithStatement: false,
		perjuryStatement: false,
		signature: "",
	});

	const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
		setForm((f) => ({ ...f, [key]: value }));

	const isValid =
		form.fullName.trim().length >= 2 &&
		form.email.includes("@") &&
		form.address.trim().length >= 10 &&
		form.copyrightedWorkDescription.trim().length >= 20 &&
		form.infringingUrl.trim().length > 0 &&
		form.goodFaithStatement &&
		form.perjuryStatement &&
		form.signature.trim().length >= 2;

	const handleSubmit = () => {
		if (!isValid) return;

		createDmca.mutate(
			{
				...form,
				goodFaithStatement: true,
				perjuryStatement: true,
			},
			{
				onSuccess: () => {
					toast.success(
						"Notice submitted",
						"We've received your DMCA takedown request and will review it within a few business days."
					);
					setForm({
						fullName: "",
						email: "",
						address: "",
						phone: "",
						copyrightedWorkDescription: "",
						infringingUrl: "",
						additionalContext: "",
						goodFaithStatement: false,
						perjuryStatement: false,
						signature: "",
					});
				},
				onError: (error) => {
					toast.error("Submission failed", error.message);
				},
			}
		);
	};

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h1 className="text-2xl font-bold">DMCA Takedown Policy</h1>
				<p className="text-muted-foreground leading-relaxed">
					Glimpse respects the intellectual property rights of others and
					expects users to do the same. If you believe content on our platform
					infringes your copyright, you may submit a takedown notice using the
					form below.
				</p>
				<p className="text-muted-foreground leading-relaxed">
					To be effective, your notice must include accurate contact
					information, a description of the copyrighted work, the exact URL of
					the infringing content, and a signed statement made under penalty of
					perjury. Submitting a false claim may expose you to legal liability.
				</p>
				<p className="text-muted-foreground leading-relaxed">
					Once a valid notice is received, we will remove or disable access to
					the reported content and notify the uploader, who may submit a
					counter-notice if they believe the removal was made in error.
				</p>
			</div>

			<div className="flex flex-col gap-5">
				<h2 className="text-lg font-semibold">Submit a DMCA Notice</h2>

				<Field label="Full legal name">
					<Input
						value={form.fullName}
						onChange={(e) => set("fullName", e.target.value)}
						placeholder="Jane Doe"
					/>
				</Field>

				<Field label="Email address">
					<Input
						type="email"
						value={form.email}
						onChange={(e) => set("email", e.target.value)}
						placeholder="jane@company.com"
					/>
				</Field>

				<Field label="Physical address">
					<Textarea
						value={form.address}
						onChange={(e) => set("address", e.target.value)}
						placeholder="Street, city, state, postal code, country"
						className="min-h-20"
					/>
				</Field>

				<Field label="Phone number (optional)">
					<Input
						value={form.phone}
						onChange={(e) => set("phone", e.target.value)}
						placeholder="+1 555 555 5555"
					/>
				</Field>

				<Field label="Description of the copyrighted work">
					<Textarea
						value={form.copyrightedWorkDescription}
						onChange={(e) => set("copyrightedWorkDescription", e.target.value)}
						placeholder="e.g. Original animation series 'Example Anime', episodes 1-12, copyright registered under..."
						className="min-h-24"
					/>
				</Field>

				<Field label="URL of the infringing content on Glimpse">
					<Input
						value={form.infringingUrl}
						onChange={(e) => set("infringingUrl", e.target.value)}
						placeholder="https://glimpse.aditsuru.com/p/..."
					/>
				</Field>

				<Field label="Additional context (optional)">
					<Textarea
						value={form.additionalContext}
						onChange={(e) => set("additionalContext", e.target.value)}
						className="min-h-20"
					/>
				</Field>

				<div className="flex flex-col gap-3 pt-2">
					<div className="flex items-start gap-2">
						<Checkbox
							checked={form.goodFaithStatement}
							onCheckedChange={(checked) =>
								set("goodFaithStatement", checked === true)
							}
							id="good-faith"
						/>
						<Label
							htmlFor="good-faith"
							className="text-sm leading-snug font-normal"
						>
							I have a good faith belief that use of the copyrighted material
							described above is not authorized by the copyright owner, its
							agent, or the law.
						</Label>
					</div>

					<div className="flex items-start gap-2">
						<Checkbox
							checked={form.perjuryStatement}
							onCheckedChange={(checked) =>
								set("perjuryStatement", checked === true)
							}
							id="perjury"
						/>
						<Label
							htmlFor="perjury"
							className="text-sm leading-snug font-normal"
						>
							I swear, under penalty of perjury, that the information in this
							notice is accurate and that I am the copyright owner or authorized
							to act on their behalf.
						</Label>
					</div>
				</div>

				<Field label="Electronic signature (type your full legal name)">
					<Input
						value={form.signature}
						onChange={(e) => set("signature", e.target.value)}
						placeholder="Jane Doe"
					/>
				</Field>

				<Button
					onClick={handleSubmit}
					disabled={!isValid || createDmca.isPending}
					className="mt-2"
				>
					{createDmca.isPending ? "Submitting..." : "Submit DMCA Notice"}
				</Button>
			</div>
		</div>
	);
}

interface FieldProps {
	label: string;
	children: React.ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
	<div className="flex flex-col gap-1.5">
		<Label className="text-sm font-medium">{label}</Label>
		{children}
	</div>
);
