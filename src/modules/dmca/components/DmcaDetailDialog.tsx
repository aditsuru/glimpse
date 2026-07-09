"use client";

import Link from "next/link";
import type * as z from "zod";
import { toast } from "@/components/misc/Toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useResolveDmcaRequest } from "@/modules/dmca/dmca.queries";
import type { dmcaSchema } from "@/modules/dmca/dmca.schema";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

type DmcaItem = z.infer<typeof dmcaSchema.getAll.output>["items"][number];

interface DmcaDetailDialogProps {
	request: DmcaItem | null;
	onClose: () => void;
}

export const DmcaDetailDialog = ({
	request,
	onClose,
}: DmcaDetailDialogProps) => {
	const openConfirm = useConfirmDialogStore((s) => s.openDialog);
	const resolveDmca = useResolveDmcaRequest();

	if (!request) return null;

	const isPending = request.status === "pending";

	const handleAction = (action: "resolve" | "dismiss") => {
		openConfirm({
			title:
				action === "resolve" ? "Mark as resolved?" : "Dismiss this request?",
			description:
				action === "resolve"
					? "Confirm you've taken the appropriate takedown action for this notice."
					: "This notice will be marked as dismissed with no action taken.",
			confirmText: action === "resolve" ? "Resolve" : "Dismiss",
			onConfirm: () => {
				resolveDmca.mutate(
					{ dmcaId: request.id, action },
					{
						onSuccess: () => {
							toast.success(
								action === "resolve" ? "Request resolved" : "Request dismissed"
							);
							onClose();
						},
						onError: (e) => toast.error("Action failed", e.message),
					}
				);
			},
		});
	};

	return (
		<Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						DMCA Notice
						<Badge variant="outline" className="capitalize">
							{request.status}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 text-sm max-h-[60vh] overflow-y-auto">
					<Field label="Full legal name">{request.fullName}</Field>
					<Field label="Email">{request.email}</Field>
					<Field label="Address">{request.address}</Field>
					{request.phone && <Field label="Phone">{request.phone}</Field>}
					<Field label="Copyrighted work">
						{request.copyrightedWorkDescription}
					</Field>
					<Field label="Infringing URL">
						<Link
							href={request.infringingUrl}
							target="_blank"
							className="text-primary hover:underline break-all"
						>
							{request.infringingUrl}
						</Link>
					</Field>
					{request.additionalContext && (
						<Field label="Additional context">
							{request.additionalContext}
						</Field>
					)}
					<Field label="Electronic signature">{request.signature}</Field>
				</div>

				{isPending && (
					<DialogFooter>
						<Button variant="outline" onClick={() => handleAction("dismiss")}>
							Dismiss
						</Button>
						<Button onClick={() => handleAction("resolve")}>
							Mark resolved
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

const Field = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<div className="flex flex-col gap-1">
		<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
			{label}
		</span>
		<p className="text-foreground">{children}</p>
	</div>
);
