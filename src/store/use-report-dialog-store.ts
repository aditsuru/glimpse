import { create } from "zustand";

interface ReportTarget {
	type: "post" | "comment";
	targetId: string;
}

interface ReportDialogState {
	isOpen: boolean;
	target: ReportTarget | null;
}

interface UseReportDialogStore {
	dialog: ReportDialogState;
	openDialog: (target: ReportTarget) => void;
	closeDialog: () => void;
}

export const useReportDialogStore = create<UseReportDialogStore>((set) => ({
	dialog: {
		isOpen: false,
		target: null,
	},
	openDialog: (target) =>
		set({
			dialog: { isOpen: true, target },
		}),
	closeDialog: () => {
		set((state) => ({
			dialog: { ...state.dialog, isOpen: false },
		}));
		setTimeout(() => {
			set(() => ({
				dialog: { isOpen: false, target: null },
			}));
		}, 200);
	},
}));
