/** biome-ignore-all lint/style/noNonNullAssertion: none */
"use client";

import Link from "next/link";
import type * as z from "zod";
import { toast } from "@/components/misc/Toast";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DEFAULT_PFP_URL } from "@/lib/shared/constants";
import { useBanUser } from "@/modules/ban/ban.queries";
import { useAdminDeleteComment } from "@/modules/comment/comment.queries";
import { useAdminDeletePost } from "@/modules/post/post.queries";
import { useResolveReport } from "@/modules/report/report.queries";
import type { reportSchema } from "@/modules/report/report.schema";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";
import { useViewerStore } from "@/store/use-viewer-store";

type ReportItem = z.infer<typeof reportSchema.getAll.output>["items"][number];

interface ReportDetailDialogProps {
	report: ReportItem | null;
	onClose: () => void;
}

export const ReportDetailDialog = ({
	report,
	onClose,
}: ReportDetailDialogProps) => {
	const openConfirm = useConfirmDialogStore((s) => s.openDialog);
	const resolveReport = useResolveReport();
	const banUser = useBanUser();
	const deletePost = useAdminDeletePost();
	const deleteComment = useAdminDeleteComment();
	const { userId: viewerId } = useViewerStore();

	if (!report) return null;

	const isPending = report.status === "pending";

	const isOwnContent = report.offender?.userId === viewerId;

	const handleResolve = (action: "resolve" | "dismiss") => {
		openConfirm({
			title:
				action === "resolve" ? "Mark as resolved?" : "Dismiss this report?",
			description:
				action === "resolve"
					? "The reporter will be notified that action was taken."
					: "The reporter will be notified that no violation was found.",
			confirmText: action === "resolve" ? "Resolve" : "Dismiss",
			onConfirm: () => {
				resolveReport.mutate(
					{ reportId: report.id, action },
					{
						onSuccess: () => {
							toast.success(
								action === "resolve" ? "Report resolved" : "Report dismissed"
							);
							onClose();
						},
						onError: (e) => toast.error("Action failed", e.message),
					}
				);
			},
		});
	};

	const handleBan = () => {
		if (!report.offender) return;
		openConfirm({
			title: `Ban @${report.offender.username}?`,
			description:
				"This will permanently delete their account and all content, and block their email from re-registering. This cannot be undone.",
			confirmText: "Ban permanently",
			confirmVariant: "destructive",
			onConfirm: () => {
				banUser.mutate(
					{
						userId: report.offender!.userId,
						reason: `Reported for ${report.reason}`,
						isPermanent: true,
					},
					{
						onSuccess: () => {
							toast.success("User banned");
							handleResolve("resolve");
						},
						onError: (e) => toast.error("Ban failed", e.message),
					}
				);
			},
		});
	};

	const handleDeleteContent = () => {
		openConfirm({
			title: "Delete this content?",
			description:
				"The author will be notified that their content was removed.",
			confirmText: "Delete",
			confirmVariant: "destructive",
			onConfirm: () => {
				if (report.targetType === "post" && report.targetPostId) {
					deletePost.mutate(
						{ postId: report.targetPostId },
						{
							onSuccess: () => {
								toast.success("Post deleted");
								handleResolve("resolve");
							},
							onError: (e) => toast.error("Delete failed", e.message),
						}
					);
				} else if (report.targetType === "comment" && report.targetCommentId) {
					deleteComment.mutate(
						{ commentId: report.targetCommentId },
						{
							onSuccess: () => {
								toast.success("Comment deleted");
								handleResolve("resolve");
							},
							onError: (e) => toast.error("Delete failed", e.message),
						}
					);
				}
			},
		});
	};

	return (
		<Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Report details
						<Badge variant="outline" className="capitalize">
							{report.status}
						</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 text-sm">
					<Field label="Reported by">
						<ActorLink actor={report.reporter} />
					</Field>

					<Field label="Reason">
						<p className="capitalize">{report.reason.replace("_", " ")}</p>
					</Field>

					{report.body && (
						<Field label="Reporter's context">
							<p className="text-muted-foreground">{report.body}</p>
						</Field>
					)}

					{report.targetType === "post" && report.targetPostId && (
						<Field label="Reported post">
							<Link
								href={`/p/${report.targetPostId}`}
								target="_blank"
								className="text-primary hover:underline"
							>
								{report.targetPostId}
							</Link>
						</Field>
					)}

					{report.targetType === "comment" &&
						report.targetCommentId &&
						report.targetPostId && (
							<Field label="Reported comment">
								<Link
									href={`/p/${report.targetPostId}?highlight=${report.targetCommentId}`}
									target="_blank"
									className="text-primary hover:underline"
								>
									{report.targetCommentId}
								</Link>
							</Field>
						)}

					{report.offender && (
						<Field label="Content author">
							<ActorLink actor={report.offender} />
						</Field>
					)}
				</div>

				{isPending && (
					<DialogFooter className="flex-wrap gap-2">
						<Button variant="outline" onClick={() => handleResolve("dismiss")}>
							Dismiss
						</Button>
						{report.targetType !== "user" && (
							<Button variant="outline" onClick={handleDeleteContent}>
								Delete content
							</Button>
						)}
						{report.offender && !isOwnContent && (
							<Button variant="destructive" onClick={handleBan}>
								Ban user
							</Button>
						)}
						{report.offender && isOwnContent && (
							<span className="text-xs text-muted-foreground self-center">
								You can't ban yourself
							</span>
						)}
						<Button onClick={() => handleResolve("resolve")}>
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
		{children}
	</div>
);

const ActorLink = ({
	actor,
}: {
	actor: {
		userId: string;
		username: string;
		displayName: string;
		avatarUrl: string | null;
	};
}) => (
	<Link
		href={`/${actor.username}`}
		target="_blank"
		className="flex items-center gap-2 hover:underline w-fit"
	>
		<Avatar className="size-6">
			<AvatarImage src={actor.avatarUrl || DEFAULT_PFP_URL} />
		</Avatar>
		<span className="font-medium">{actor.displayName}</span>
		<span className="text-muted-foreground">@{actor.username}</span>
	</Link>
);
