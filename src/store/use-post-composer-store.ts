import { create } from "zustand";

type PostComposerStore = {
	isOpen: boolean;
	isLocked: boolean;
	isDirty: boolean;
	composerKey: number;
	open: () => void;
	close: () => void;
	setLocked: (locked: boolean) => void;
	setDirty: (dirty: boolean) => void;
	resetComposer: () => void;
};

export const usePostComposerStore = create<PostComposerStore>((set) => ({
	isOpen: false,
	isLocked: false,
	isDirty: false,
	composerKey: 0,
	open: () => set({ isOpen: true }),
	close: () => set({ isOpen: false }),
	setLocked: (isLocked) => set({ isLocked }),
	setDirty: (isDirty) => set({ isDirty }),
	resetComposer: () =>
		set((state) => ({ composerKey: state.composerKey + 1, isDirty: false })),
}));
