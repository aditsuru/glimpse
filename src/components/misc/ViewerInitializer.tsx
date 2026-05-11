"use client";

import { useRef } from "react";
import { useViewerStore } from "@/store/use-viewer-store";

interface ViewerInitializerProps {
	userId: string;
	username: string;
}

export const ViewerInitializer = ({
	userId,
	username,
}: ViewerInitializerProps) => {
	const initialized = useRef(false);
	if (!initialized.current) {
		useViewerStore.getState().setViewer(userId, username);
		initialized.current = true;
	}
	return null;
};
