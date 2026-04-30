"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/lib/shared/config";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: config.NEXT_PUBLIC_QUERY_STALE_TIME,
						retry: config.NEXT_PUBLIC_QUERY_MAX_RETRIES,
						gcTime: config.NEXT_PUBLIC_QUERY_GC_TIME,
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
				defaultTheme="dark"
				enableSystem
				disableTransitionOnChange
			>
				<TooltipProvider>{children}</TooltipProvider>
				<Toaster
					className="z-100!"
					toastOptions={{
						className: "bg-background! text-[16px]!",
						classNames: {
							error: "text-destructive! border-destructive/40!",
							success: "text-success! border-success/40!",
						},
					}}
				/>
			</NextThemesProvider>
		</QueryClientProvider>
	);
}

export default Providers;
