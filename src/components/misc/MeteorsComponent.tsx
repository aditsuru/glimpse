"use client";

import { useSettingsStore } from "@/store/use-settings-store";
import { Meteors } from "../ui/meteors";

const MeteorsComponent = () => {
	const isMeteorsEnabeld = useSettingsStore((state) => state.isMeteorsEnabled);

	if (!isMeteorsEnabeld) return null;

	return <Meteors className="-z-20" />;
};

export default MeteorsComponent;
