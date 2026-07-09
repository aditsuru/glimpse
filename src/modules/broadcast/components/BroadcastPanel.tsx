"use client";

import { useState } from "react";
import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendBroadcast } from "@/modules/broadcast/broadcast.queries";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

export const BroadcastPanel = () => {
	const [body, setBody] = useState("");
	const openConfirm = useConfirmDialogStore((s) => s.openDialog);
	const sendBroadcast = useSendBroadcast();

	const isValid = body.trim().length >= 5;

	const handleSend = () => {
		openConfirm({
			title: "Send to all users?",
			description:
				"This sends a system notification to every user on the platform. This cannot be undone or recalled.",
			confirmText: "Send to everyone",
			confirmVariant: "destructive",
			onConfirm: () => {
				sendBroadcast.mutate(
					{ body },
					{
						onSuccess: (data) => {
							toast.success(
								"Broadcast sent",
								`Delivered to ${data.count} user${data.count === 1 ? "" : "s"}.`
							);
							setBody("");
						},
						onError: (e) => toast.error("Broadcast failed", e.message),
					}
				);
			},
		});
	};

	return (
		<div className="flex flex-col gap-4 max-w-lg">
			<div>
				<h2 className="text-lg font-semibold">Broadcast a system message</h2>
				<p className="text-sm text-muted-foreground">
					Every user will receive this as a notification. Use sparingly.
				</p>
			</div>

			<Textarea
				value={body}
				onChange={(e) => setBody(e.target.value)}
				placeholder="e.g. We've updated our terms of service..."
				className="min-h-32"
			/>

			<Button
				onClick={handleSend}
				disabled={!isValid || sendBroadcast.isPending}
				className="w-fit"
			>
				{sendBroadcast.isPending ? "Sending..." : "Send to all users"}
			</Button>
		</div>
	);
};
