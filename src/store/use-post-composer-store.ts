import { create } from "zustand";

type PostComposerStore = {
	isOpen: boolean;
	isLocked: boolean;
	open: () => void;
	close: () => void;
	setLocked: (locked: boolean) => void;
};

export const usePostComposerStore = create<PostComposerStore>((set) => ({
	isOpen: false,
	isLocked: false,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	setLocked: (isLocked) => set({ isLocked }),
}));
