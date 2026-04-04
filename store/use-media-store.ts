import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

interface MediaState {
	isMuted: boolean;
	setMuted: (muted: boolean) => void;
	activeVideoId: string | null;
	setActiveVideoId: (id: string | null) => void;
}

export const useMediaStore = create<MediaState>()(
	persist(
		(set) => ({
			isMuted: true,
			setMuted: (isMuted) => set({ isMuted }),
			activeVideoId: null,
			setActiveVideoId: (activeVideoId) => set({ activeVideoId }),
		}),
		{
			name: LOCAL_STORAGE_KEYS.GLIMPSE_MEDIA_STORAGE,
			partialize: (state) => ({ isMuted: state.isMuted }),
		}
	)
);
