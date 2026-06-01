"use client";

import { BILLBOARD_FRAME, TRANSITION_MEDIA } from "@/lib/shared/static-files";
import { useGetBillboard } from "@/modules/post/post.queries";
import { useSettingsStore } from "@/store/use-settings-store";
import { Billboard } from "../misc/Billboard";
import { BillboardVideo } from "../misc/BillboardVideo";

export const SecondarySidebar = () => {
	const isBillboardEnabled = useSettingsStore(
		(state) => state.isBillboardEnabled
	);

	const { data: posts, isLoading } = useGetBillboard();

	return (
		<aside className="w-full h-full px-20">
			{isBillboardEnabled && (
				<Billboard frameSrc={BILLBOARD_FRAME}>
					{!isLoading && posts && (
						<BillboardVideo posts={posts} transitionVideo={TRANSITION_MEDIA} />
					)}
				</Billboard>
			)}
		</aside>
	);
};
