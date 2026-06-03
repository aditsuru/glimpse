"use client";

import { Fingerprint, Key, Mail, ShieldAlert, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader } from "@/components/misc/Loader";
import { ScrollContainer } from "@/components/VideoPlayer/ScrollContainer";
import { useGetSecuritySettings } from "@/modules/account/account.queries";
import { ChangeEmailDialog } from "@/modules/account/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/modules/account/components/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/modules/account/components/DeleteAccountDialog";
import { ManageOAuthSection } from "@/modules/account/components/ManageOAuthSection";
import { SetPasswordDialog } from "@/modules/account/components/SetPasswordDialog";

export default function AccountSettingsPage() {
	const { data, isLoading } = useGetSecuritySettings();

	if (isLoading || !data) {
		return (
			<main className="flex flex-col w-full h-full overflow-hidden">
				<PageHeader title="Account Settings" className="shrink-0" />
				<div className="flex-1 flex justify-center py-12">
					<Loader />
				</div>
			</main>
		);
	}

	return (
		<main className="flex flex-col w-full h-full overflow-hidden">
			<PageHeader title="Account Settings" className="shrink-0" />
			<ScrollContainer className="flex-1 overflow-y-auto no-scrollbar relative w-full px-12 py-8">
				<div className="flex flex-col gap-8 max-w-2xl">
					{/* Account Information Section */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Mail className="size-5" /> Email
						</h2>
						<div className="flex justify-between items-center">
							<div className="flex flex-col gap-1">
								<span className="text-sm text-muted-foreground">
									Primary Email
								</span>
								<span className="font-medium">{data.email}</span>
							</div>
							<ChangeEmailDialog />
						</div>
					</div>

					{/* Security Section */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Key className="size-5" /> Security
						</h2>

						<div className="flex flex-col overflow-hidden">
							{data.hasPassword ? (
								<div className="flex justify-between items-center font-semibold">
									<p>Change Your Password</p>
									<ChangePasswordDialog email={data.email} />
								</div>
							) : (
								<div className="flex justify-between items-center text-yellow-500">
									<span className="font-medium flex items-center gap-2">
										<ShieldAlert className="size-4" /> No password set
									</span>
									<SetPasswordDialog />
								</div>
							)}
						</div>
					</div>

					{/* OAuth Section */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Fingerprint className="size-5" /> OAuth
						</h2>
						<ManageOAuthSection
							linkedProviders={data.oauthProviders}
							hasPassword={data.hasPassword}
						/>
					</div>

					{/* Danger Zone Section */}
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
							<Trash2 className="size-5" /> Danger Zone
						</h2>
						<div className="rounded-xl p-4 bg-destructive/10 border-destructive/20 border">
							<p className="text-sm mb-4 text-destructive">
								Once you delete your account, there is no going back. Please be
								certain.
							</p>
							<DeleteAccountDialog disabled={!data.hasPassword} />
						</div>
					</div>
				</div>
			</ScrollContainer>
		</main>
	);
}
