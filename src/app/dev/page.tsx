"use client";

import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";

export default function DevToastPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<Button
				onClick={() =>
					toast.success("Post published", "Your post is now live on the feed.")
				}
			>
				Success Toast
			</Button>
			<Button
				variant="destructive"
				onClick={() =>
					toast.error(
						"Something went wrong",
						"Failed to upload attachment. Please try again."
					)
				}
			>
				Error Toast
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast.info(
						"New update available",
						"Refresh the page to get the latest version."
					)
				}
			>
				Info Toast
			</Button>
		</div>
	);
}
