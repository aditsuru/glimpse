import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MediaState {
	isMuted: boolean;
	setMuted: (muted: boolean) => void;
	activeVideoId: string | null;
	setActiveVideoId: (id: string | null) => void;
}

export const useMediaStore = create<MediaState>()(
	persist(
		(set) => ({
			isMuted: true, // Default to muted for autoplay compliance
			setMuted: (isMuted) => set({ isMuted }),
			activeVideoId: null,
			setActiveVideoId: (activeVideoId) => set({ activeVideoId }),
		}),
		{
			name: "glimpse-media-storage",
			partialize: (state) => ({ isMuted: state.isMuted }), // Only persist mute preference
		}
	)
);
