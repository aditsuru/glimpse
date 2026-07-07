"use client";

import { ORPCError } from "@orpc/client";
import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/shared/config";

const handleBanError = (error: unknown) => {
	if (
		error instanceof ORPCError &&
		error.code === "FORBIDDEN" &&
		(error.data as { reason?: string })?.reason === "banned"
	) {
		window.location.href = "/banned";
	}
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime:
							config.NEXT_PUBLIC_QUERY_STALE_TIME === 0
								? Infinity
								: config.NEXT_PUBLIC_QUERY_STALE_TIME,
						retry: config.NEXT_PUBLIC_QUERY_MAX_RETRIES,
						gcTime: config.NEXT_PUBLIC_QUERY_GC_TIME,
						refetchOnWindowFocus: false,
						refetchOnReconnect: true,
						refetchOnMount: true,
					},
					mutations: {
						retry: 0,
					},
				},
				queryCache: new QueryCache({
					onError: handleBanError,
				}),
				mutationCache: new MutationCache({
					onError: handleBanError,
				}),
			})
	);
	return (
		<QueryClientProvider client={queryClient}>
			<NextThemesProvider
				attribute="class"
				defaultTheme="dark"
				enableSystem
				disableTransitionOnChange
			>
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster
					className="z-100!"
					toastOptions={{
						className: "bg-background! text-[14px]! gap-2! p-6!",
						classNames: {
							error: "text-destructive!",
							success: "text-success!",
						},
					}}
				/>
			</NextThemesProvider>
		</QueryClientProvider>
	);
};
