import { create } from "zustand";

interface UnfollowConfirmState {
	isOpen: boolean;
	targetUsername: string;
	onConfirm: () => void;
}

interface useUnfollowConfirmState {
	unfollowDialog: UnfollowConfirmState;
	// Actions
	openUnfollowDialog: (username: string, onConfirm: () => void) => void;
	closeUnfollowDialog: () => void;
}

const initialUnfollowConfirmState: UnfollowConfirmState = {
	isOpen: false,
	targetUsername: "",
	onConfirm: () => {},
};

export const useUnfollowConfirmStore = create<useUnfollowConfirmState>(
	(set) => ({
		unfollowDialog: initialUnfollowConfirmState,

		openUnfollowDialog: (targetUsername, onConfirm) =>
			set({
				unfollowDialog: {
					isOpen: true,
					targetUsername,
					onConfirm,
				},
			}),

		closeUnfollowDialog: () => {
			set((state) => ({
				unfollowDialog: { ...state.unfollowDialog, isOpen: false },
			}));
			setTimeout(() => {
				set(() => ({ unfollowDialog: { ...initialUnfollowConfirmState } }));
			}, 200);
		},
	})
);
