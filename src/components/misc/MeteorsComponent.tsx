"use client";

import { useSettingsStore } from "@/store/use-settings-store";
import { Meteors } from "../ui/meteors";

export const MeteorsComponent = () => {
	const isMeteorsEnabled = useSettingsStore((state) => state.isMeteorsEnabled);

	if (!isMeteorsEnabled) return null;

	return <Meteors className="-z-20" />;
};
