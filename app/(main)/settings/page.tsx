"use client";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/useUIStore";

function Settings() {
	const toggleSnowfall = useUIStore((state) => state.toggleSnowfall);
	return (
		<div className="p-8">
			<Button onClick={toggleSnowfall} className="">
				Toggle Snowfall
			</Button>
		</div>
	);
}

export default Settings;
