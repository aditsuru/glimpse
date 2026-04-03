"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function Home() {
	return (
		<div className="h-screen w-screen flex justify-center items-center">
			<Button
				onClick={() =>
					toast("Event has been created", {
						description: "Monday, January 3rd at 6:00pm",
					})
				}
				variant="outline"
				className="w-fit"
			>
				Show Toast
			</Button>
		</div>
	);
}

export default Home;
