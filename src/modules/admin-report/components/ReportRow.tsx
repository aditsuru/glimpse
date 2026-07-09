"use client";

import type * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { formatPostDate } from "@/lib/client/helpers";
import type { reportSchema } from "@/modules/report/report.schema";

type ReportItem = z.infer<typeof reportSchema.getAll.output>["items"][number];

const REASON_LABELS: Record<string, string> = {
	spam: "Spam",
	nsfw: "NSFW",
	harassment: "Harassment",
	hate_speech: "Hate speech",
	self_harm: "Self-harm",
	misinformation: "Misinformation",
	copyright: "Copyright",
	other: "Other",
};

interface ReportRowProps {
	report: ReportItem;
	onClick: () => void;
}

export const ReportRow = ({ report, onClick }: ReportRowProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center justify-between gap-4 px-4 py-3 border-b border-accent last:border-b-0 hover:bg-accent/15 text-left transition-colors"
		>
			<div className="flex items-center gap-3 min-w-0">
				<Badge variant="outline" className="shrink-0 capitalize">
					{report.targetType}
				</Badge>
				<span className="text-sm font-medium truncate">
					{REASON_LABELS[report.reason] ?? report.reason}
				</span>
				<span className="text-sm text-muted-foreground truncate">
					reported by @{report.reporter.username}
				</span>
			</div>
			<span className="text-xs text-muted-foreground shrink-0">
				{formatPostDate(report.createdAt)}
			</span>
		</button>
	);
};
