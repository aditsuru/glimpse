import { create } from "zustand";

type PostComposerStore = {
	isOpen: boolean;
	open: () => void;
	close: () => void;
};

export const usePostComposerStore = create<PostComposerStore>((set) => ({
	isOpen: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
}));
