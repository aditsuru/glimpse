import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

interface MediaState {
	/** Global mute state — persisted */
	isMuted: boolean;
	setMuted: (muted: boolean) => void;

	/** Global volume 0-1 — persisted. Independent from mute. */
	volume: number;
	setVolume: (volume: number) => void;

	/** src string of the currently playing video. null = nothing playing. Runtime only. */
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
			// Only persist user preferences, never runtime state
			partialize: (state) => ({
				volume: state.volume,
			}),
			onRehydrateStorage: () => (state) => {
				// Always start a new session with no active video
				state?.setActiveVideoId(null);
			},
		}
	)
);
