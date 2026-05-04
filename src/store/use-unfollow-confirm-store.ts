import { create } from "zustand";

interface DialogState {
	isOpen: boolean;
	targetUsername: string;
	onConfirm: () => void;
}

interface useDialogState {
	unfollowDialog: DialogState;
	// Actions
	openUnfollowDialog: (username: string, onConfirm: () => void) => void;
	closeUnfollowDialog: () => void;
}

const initialDialogState: DialogState = {
	isOpen: false,
	targetUsername: "",
	onConfirm: () => {},
};

export const useDialogStore = create<useDialogState>((set) => ({
	unfollowDialog: initialDialogState,

	openUnfollowDialog: (targetUsername, onConfirm) =>
		set({
			unfollowDialog: {
				isOpen: true,
				targetUsername,
				onConfirm,
			},
		}),

	closeUnfollowDialog: () =>
		set(() => ({
			unfollowDialog: { ...initialDialogState },
		})),
}));
