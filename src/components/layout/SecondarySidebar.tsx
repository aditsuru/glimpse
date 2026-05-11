"use client";

import { config } from "@/lib/shared/config";
import { BILLBOARD_FRAME, TIME_BREAK_MEDIA } from "@/lib/shared/static-files";
import { useSettingsStore } from "@/store/use-settings-store";
import { Billboard } from "../misc/Billboard";
import { BillboardVideo } from "../misc/BillboardVideo";

export const SecondarySidebar = () => {
	const hardcodedTrendingVideos = [
		"attachment/ANiZSxOWCskW7XRynbsruqjap0bvftLP/JPj7yJW21pYvRdLdmoBuK",
		"attachment/ANiZSxOWCskW7XRynbsruqjap0bvftLP/rPUKF7Vo9MGXhKydUsrXc",
	].map((i) => `${config.NEXT_PUBLIC_R2_PUBLIC_URL}/${i}`);

	const isBillboardEnabled = useSettingsStore(
		(state) => state.isBillboardEnabled
	);

	return (
		<aside className="w-full h-full px-20">
			{isBillboardEnabled && (
				<Billboard frameSrc={BILLBOARD_FRAME}>
					<BillboardVideo
						timeBreakVideos={TIME_BREAK_MEDIA}
						trendingVideos={hardcodedTrendingVideos}
					/>
				</Billboard>
			)}
		</aside>
	);
};
