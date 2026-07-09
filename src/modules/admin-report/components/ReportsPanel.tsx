"use client";

import { useState } from "react";
import type * as z from "zod";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetReports } from "@/modules/report/report.queries";
import type { reportSchema } from "@/modules/report/report.schema";
import { ReportDetailDialog } from "./ReportDetailDialog";
import { ReportRow } from "./ReportRow";

type ReportStatus = "pending" | "resolved" | "dismissed";
type ReportItem = z.infer<typeof reportSchema.getAll.output>["items"][number];

const STATUS_TABS: { value: ReportStatus; label: string }[] = [
	{ value: "pending", label: "Unresolved" },
	{ value: "resolved", label: "Resolved" },
	{ value: "dismissed", label: "Dismissed" },
];

export const ReportsPanel = () => {
	const [status, setStatus] = useState<ReportStatus>("pending");
	const [selected, setSelected] = useState<ReportItem | null>(null);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useGetReports(status);

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const reports = data?.pages.flatMap((p) => p.items) ?? [];

	return (
		<div className="flex flex-col gap-6">
			<Tabs
				value={status}
				onValueChange={(v) => v && setStatus(v as ReportStatus)}
			>
				<TabsList>
					{STATUS_TABS.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="flex flex-col rounded-lg border border-accent overflow-x-hidden no-scrollbar overflow-y-auto py-4 mb-4">
				{reports.map((report) => (
					<ReportRow
						key={report.id}
						report={report}
						onClick={() => setSelected(report)}
					/>
				))}

				{isLoading && (
					<div className="py-8 flex justify-center">
						<Loader />
					</div>
				)}

				{reports.length === 0 && !isLoading && (
					<div className="py-6">
						<EmptyStateMessage
							title="Nothing here"
							description={`No ${STATUS_TABS.find((t) => t.value === status)?.label.toLowerCase()} reports.`}
						/>
					</div>
				)}

				{hasNextPage && (
					<div ref={ref} className="py-8 flex justify-center">
						<Loader />
					</div>
				)}
			</div>

			<ReportDetailDialog report={selected} onClose={() => setSelected(null)} />
		</div>
	);
};
