"use client";

import SnowfallComponent from "react-snowfall";
import { useSettingsStore } from "@/store/use-settings-store";

export const Snowfall = () => {
	const isSnowfallEnabled = useSettingsStore(
		(state) => state.isSnowfallEnabled
	);

	if (!isSnowfallEnabled) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-900">
			<SnowfallComponent />
		</div>
	);
};
