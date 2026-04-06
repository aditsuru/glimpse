"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/config";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: config.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_STALE_TIME,
						retry: config.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_MAX_RETRY_COUNT,
						gcTime: config.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_GC_TIME,
						refetchOnWindowFocus: true,
						refetchOnReconnect: true,
					},
					mutations: {
						retry: 0,
					},
				},
			})
	);
	return (
		<QueryClientProvider client={queryClient}>
			<NextThemesProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster className="z-100!" />
			</NextThemesProvider>
		</QueryClientProvider>
	);
}

export default Providers;
