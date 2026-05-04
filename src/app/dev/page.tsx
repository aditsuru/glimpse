"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Dev() {
	const handleClick = () => {
		toast.success("Successfully created profile");
	};
	return (
		<main className="w-screen h-dvh flex flex-col items-center justify-center">
			<Button onClick={handleClick}>Toast</Button>
		</main>
	);
}

export default Dev;
