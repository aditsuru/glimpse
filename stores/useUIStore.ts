import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIStore = {
	snowfall: boolean;
	toggleSnowfall: () => void;
};

export const useUIStore = create<UIStore>()(
	persist(
		(set) => ({
			snowfall: true,
			toggleSnowfall: () => set((state) => ({ snowfall: !state.snowfall })),
		}),
		{ name: "ui-settings" }
	)
);
