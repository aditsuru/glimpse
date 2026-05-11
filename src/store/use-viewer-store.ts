import { create } from "zustand";

interface ViewerState {
	userId: string;
	username: string;
	setViewer: (userId: string, username: string) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
	userId: "",
	username: "",
	setViewer: (userId, username) => set({ userId, username }),
}));
