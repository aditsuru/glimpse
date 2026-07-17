"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { startProgress } from "@/lib/client/helpers";
import { useCreateReport } from "@/modules/report/report.queries";
import { REPORT_REASONS } from "@/modules/report/report.schema";
import { useReportDialogStore } from "@/store/use-report-dialog-store";

const REASON_LABELS: Record<(typeof REPORT_REASONS)[number], string> = {
	spam: "Spam",
	nsfw: "NSFW / Explicit content",
	harassment: "Harassment or bullying",
	hate_speech: "Hate speech",
	self_harm: "Self-harm or suicide",
	misinformation: "Misinformation",
	copyright: "Copyright infringement",
	other: "Other",
};

export const ReportDialog = () => {
	const { dialog, closeDialog } = useReportDialogStore();
	const router = useRouter();
	const createReport = useCreateReport();

	const [reason, setReason] = useState<string>("");
	const [body, setBody] = useState("");

	const reset = () => {
		setReason("");
		setBody("");
	};

	const handleClose = () => {
		closeDialog();
		reset();
	};

	const handleReasonChange = (value: string) => {
		setReason(value);
	};

	const handleSubmit = () => {
		if (!dialog.target || !reason) return;

		if (reason === "copyright") {
			handleClose();
			startProgress();
			router.push("/legal/dmca");
			return;
		}

		createReport.mutate(
			{
				targetType: dialog.target.type,
				targetId: dialog.target.targetId,
				reason: reason as (typeof REPORT_REASONS)[number],
				body,
			},
			{
				onSuccess: () => {
					toast.success(
						"Report submitted",
						"Thanks for helping keep the community safe. Our team will review this shortly."
					);
					handleClose();
				},
				onError: (error) => {
					toast.error("Couldn't submit report", error.message);
				},
			}
		);
	};

	const isValid =
		reason === "copyright" || (reason !== "" && body.trim().length >= 10);

	const reasons = REPORT_REASONS.filter(
		(r) => !(r === "copyright" && dialog.target?.type === "comment")
	);

	return (
		<Dialog
			open={dialog.isOpen}
			onOpenChange={(open) => !open && handleClose()}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Report {dialog.target?.type}</DialogTitle>
					<DialogDescription>
						Help us understand what's wrong. Reports are reviewed by our team.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<RadioGroup
						value={reason}
						onValueChange={handleReasonChange}
						className="gap-3"
					>
						{reasons.map((r) => (
							<div key={r} className="flex items-center gap-2">
								<RadioGroupItem value={r} id={r} />
								<Label htmlFor={r} className="font-normal">
									{REASON_LABELS[r]}
								</Label>
							</div>
						))}
					</RadioGroup>

					{reason && reason !== "copyright" && (
						<div className="flex flex-col gap-1.5">
							<Textarea
								placeholder="Provide additional context (min 10 characters)..."
								value={body}
								onChange={(e) => setBody(e.target.value)}
								className="min-h-24"
							/>
							<p className="text-xs text-muted-foreground text-right">
								{body.trim().length}/10 minimum
							</p>
						</div>
					)}

					{reason === "copyright" && (
						<p className="text-sm text-muted-foreground">
							Copyright claims are handled through our dedicated DMCA process.
							Clicking submit will take you there.
						</p>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!isValid || createReport.isPending}
					>
						{createReport.isPending ? "Submitting..." : "Submit report"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
