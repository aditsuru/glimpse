"use client";

import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { toast } from "@/components/misc/Toast";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/client/auth-client";
import { orpc } from "@/lib/client/orpc-client";
import { useConfirmDialogStore } from "@/store/use-confirm-dialog-store";

const AVAILABLE_PROVIDERS = [
	{
		id: "github",
		name: "GitHub",
		icon: "https://assets.aditsuru.com/icons/dark/github.svg",
	},
	{
		id: "google",
		name: "Google",
		icon: "https://assets.aditsuru.com/icons/google.svg",
	},
] as const;

export const ManageOAuthSection = ({
	linkedProviders,
	hasPassword,
}: {
	linkedProviders: string[];
	hasPassword: boolean;
}) => {
	const queryClient = useQueryClient();
	const openConfirmDialog = useConfirmDialogStore((state) => state.openDialog);
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const handleLink = async (provider: "github" | "google") => {
		setIsLoading(provider);
		const { error } = await authClient.linkSocial({
			provider,
			callbackURL: "/settings/account",
		});

		if (error) {
			toast.error(
				`Link failed`,
				`We couldn't connect your ${provider} account. Please try again.`
			);
			setIsLoading(null);
		}
	};

	const handleUnlink = (providerId: string, providerName: string) => {
		openConfirmDialog({
			title: `Unlink ${providerName}?`,
			description: `Are you sure you want to disconnect your ${providerName} account? You won't be able to log in with it anymore.`,
			confirmText: "Unlink",
			confirmVariant: "destructive",
			onConfirm: async () => {
				setIsLoading(providerId);

				const { error } = await authClient.unlinkAccount({
					providerId,
				});

				if (error) {
					toast.error(
						`Unlink failed`,
						`We couldn't disconnect your ${providerName} account. Please try again.`
					);
				} else {
					toast.success(
						"Account disconnected",
						`Your ${providerName} account has been successfully unlinked.`
					);
					await queryClient.invalidateQueries({
						queryKey: orpc.account.getSecuritySettings.key(),
					});
				}
				setIsLoading(null);
			},
		});
	};

	return (
		<div className="flex flex-col gap-3">
			{AVAILABLE_PROVIDERS.map((provider) => {
				const isLinked = linkedProviders.includes(provider.id);

				const isLastLoginMethod = !hasPassword && linkedProviders.length === 1;
				const disableUnlink = isLinked && isLastLoginMethod;

				return (
					<div
						key={provider.id}
						className="bg-accent/10 border border-accent rounded-xl p-4 flex justify-between items-center"
					>
						<div className="flex items-center gap-3">
							<div className="p-2 bg-background rounded-full border border-accent flex items-center justify-center">
								<Image
									src={provider.icon}
									width={20}
									height={20}
									alt={`${provider.name} icon`}
									priority
								/>
							</div>
							<div className="flex flex-col">
								<span className="font-medium">{provider.name}</span>
								<span className="text-xs text-muted-foreground">
									{isLinked ? "Connected" : "Not connected"}
								</span>
							</div>
						</div>

						{isLinked ? (
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
								disabled={isLoading === provider.id || disableUnlink}
								onClick={() => handleUnlink(provider.id, provider.name)}
								title={
									disableUnlink
										? "You must set a password or link another account before unlinking this one."
										: undefined
								}
							>
								{isLoading === provider.id
									? "Unlinking..."
									: disableUnlink
										? "Cannot Unlink"
										: "Unlink"}
							</Button>
						) : (
							<Button
								variant="outline"
								size="sm"
								disabled={isLoading === provider.id}
								onClick={() => handleLink(provider.id)}
							>
								{isLoading === provider.id ? "Connecting..." : "Connect"}
							</Button>
						)}
					</div>
				);
			})}
		</div>
	);
};
