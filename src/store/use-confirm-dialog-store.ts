import { create } from "zustand";

interface ConfirmDialogOptions {
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: "default" | "destructive" | "outline" | "secondary";
	className?: string;
	onConfirm: () => void;
	onCancel?: () => void;
}

interface ConfirmDialogState {
	isOpen: boolean;
	options: ConfirmDialogOptions;
}

interface UseConfirmDialogStore {
	dialog: ConfirmDialogState;
	openDialog: (options: ConfirmDialogOptions) => void;
	closeDialog: () => void;
}

const initialOptions: ConfirmDialogOptions = {
	title: "",
	description: "",
	confirmText: "Confirm",
	cancelText: "Cancel",
	confirmVariant: "default",
	className: "sm:max-w-md",
	onConfirm: () => {},
};

export const useConfirmDialogStore = create<UseConfirmDialogStore>((set) => ({
	dialog: {
		isOpen: false,
		options: initialOptions,
	},
	openDialog: (options) =>
		set({
			dialog: {
				isOpen: true,
				options: { ...initialOptions, ...options },
			},
		}),
	closeDialog: () => {
		set((state) => ({
			dialog: { ...state.dialog, isOpen: false },
		}));
		setTimeout(() => {
			set(() => ({
				dialog: { isOpen: false, options: initialOptions },
			}));
		}, 200);
	},
}));
