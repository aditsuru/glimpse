import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LOCAL_STORAGE_KEYS } from "@/lib/shared/constants";

interface SettingsState {
	issidebarGifGalleryEnabled: boolean;
	setsidebarGifGalleryEnabled: (toggle: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
	persist(
		(set) => ({
			// Initial State
			issidebarGifGalleryEnabled: true,

			// Actions
			setsidebarGifGalleryEnabled: (toggle) =>
				set({ issidebarGifGalleryEnabled: toggle }),
		}),
		{
			name: LOCAL_STORAGE_KEYS.SIDEBAR_GIF_PANEL_TOGGLE,
		}
	)
);
