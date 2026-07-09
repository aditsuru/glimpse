"use client";

import { useState } from "react";
import type * as z from "zod";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useGetDmcaRequests } from "@/modules/dmca/dmca.queries";
import type { dmcaSchema } from "@/modules/dmca/dmca.schema";
import { DmcaDetailDialog } from "./DmcaDetailDialog";

type DmcaStatus = "pending" | "resolved" | "dismissed";
type DmcaItem = z.infer<typeof dmcaSchema.getAll.output>["items"][number];

const STATUS_TABS: { value: DmcaStatus; label: string }[] = [
	{ value: "pending", label: "Unresolved" },
	{ value: "resolved", label: "Resolved" },
	{ value: "dismissed", label: "Dismissed" },
];

export const DmcaPanel = () => {
	const [status, setStatus] = useState<DmcaStatus>("pending");
	const [selected, setSelected] = useState<DmcaItem | null>(null);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useGetDmcaRequests(status);

	const ref = useInfiniteScroll(fetchNextPage, isFetchingNextPage);
	const requests = data?.pages.flatMap((p) => p.items) ?? [];

	return (
		<div className="flex flex-col gap-6">
			<Tabs
				value={status}
				onValueChange={(v) => v && setStatus(v as DmcaStatus)}
			>
				<TabsList>
					{STATUS_TABS.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			<div className="flex flex-col rounded-lg border border-accent overflow-x-hidden py-4 no-scrollbar overflow-y-auto">
				{requests.map((req) => (
					<button
						key={req.id}
						type="button"
						onClick={() => setSelected(req)}
						className="flex items-center justify-between gap-4 px-4 py-3 border-b border-accent last:border-b-0 hover:bg-accent/15 text-left transition-colors"
					>
						<div className="flex flex-col min-w-0">
							<span className="text-sm font-medium truncate">
								{req.fullName}
							</span>
							<span className="text-xs text-muted-foreground truncate">
								{req.email}
							</span>
						</div>
						<span className="text-xs text-muted-foreground shrink-0">
							{new Date(req.createdAt).toLocaleDateString()}
						</span>
					</button>
				))}

				{isLoading && (
					<div className="py-8 flex justify-center">
						<Loader />
					</div>
				)}

				{requests.length === 0 && !isLoading && (
					<div className="py-6">
						<EmptyStateMessage
							title="Nothing here"
							description="No requests in this status."
						/>
					</div>
				)}

				{hasNextPage && (
					<div ref={ref} className="py-8 flex justify-center">
						<Loader />
					</div>
				)}
			</div>

			<DmcaDetailDialog request={selected} onClose={() => setSelected(null)} />
		</div>
	);
};
