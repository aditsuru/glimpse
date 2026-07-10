import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

interface MediaState {
	isMuted: boolean;
	setMuted: (muted: boolean) => void;

	volume: number;
	setVolume: (volume: number) => void;

	activeVideoId: string | null;
	setActiveVideoId: (id: string | null) => void;

	isPausedGlobally: boolean;
	setPausedGlobally: (isPausedGlobally: boolean) => void;
}

export const useMediaStore = create<MediaState>()(
	persist(
		(set) => ({
			isMuted: true,
			setMuted: (isMuted) => set({ isMuted }),
			volume: 0.8,
			setVolume: (volume) => set({ volume }),
			activeVideoId: null,
			setActiveVideoId: (activeVideoId) => set({ activeVideoId }),
			isPausedGlobally: false,
			setPausedGlobally: (isPausedGlobally) => set({ isPausedGlobally }),
		}),
		{
			name: LOCAL_STORAGE_KEYS.GLIMPSE_MEDIA_STORAGE,
			partialize: (state) => ({
				volume: state.volume,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setActiveVideoId(null);
			},
		}
	)
);
