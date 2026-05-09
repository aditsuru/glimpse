"use client";

import { createContext, useContext } from "react";

const ProfileContext = createContext<{ username: string } | null>(null);

export const ProfileProvider = ({
	username,
	children,
}: {
	username: string;
	children: React.ReactNode;
}) => {
	return (
		<ProfileContext.Provider value={{ username }}>
			{children}
		</ProfileContext.Provider>
	);
};

export const useProfileContext = () => {
	const ctx = useContext(ProfileContext);
	if (!ctx)
		throw new Error("useProfileContext must be used within ProfileProvider");
	return ctx;
};
