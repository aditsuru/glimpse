import { create } from "zustand";

interface DeletePostConfirmState {
	isOpen: boolean;
	onConfirm: () => void;
}

interface UseDeletePostConfirmStore {
	dialog: DeletePostConfirmState;
	openDialog: (onConfirm: () => void) => void;
	closeDialog: () => void;
}

const initialState: DeletePostConfirmState = {
	isOpen: false,
	onConfirm: () => {},
};

export const useDeletePostConfirmStore = create<UseDeletePostConfirmStore>(
	(set) => ({
		dialog: initialState,
		openDialog: (onConfirm) =>
			set({
				dialog: { isOpen: true, onConfirm },
			}),
		closeDialog: () => {
			set((state) => ({
				dialog: { ...state.dialog, isOpen: false },
			}));
			setTimeout(() => {
				set(() => ({ dialog: { ...initialState } }));
			}, 200); // Wait for exit animation before clearing the callback
		},
	})
);
