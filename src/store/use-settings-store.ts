import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

interface SettingsState {
	isSidebarGifGalleryEnabled: boolean;
	isSnowfallEnabled: boolean;
	setSidebarGifGalleryEnabled: (toggle: boolean) => void;
	setSnowfallEnabled: (toggle: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			// Initial State
			isSidebarGifGalleryEnabled: false,
			isSnowfallEnabled: false,
			// Actions
			setSidebarGifGalleryEnabled: (toggle) =>
				set({ isSidebarGifGalleryEnabled: toggle }),
			setSnowfallEnabled: (toggle) => set({ isSnowfallEnabled: toggle }),
		}),
		{
			name: LOCAL_STORAGE_KEYS.SETTINGS_STORAGE,
		}
	)
);
