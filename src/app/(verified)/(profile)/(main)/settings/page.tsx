"use client";

import { HatGlasses, Presentation, Snowflake, Sparkles } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/client/auth-client";
import {
	useProfile,
	useUpdateVisibility,
} from "@/modules/profile/profile.queries";
import { useSettingsStore } from "@/store/use-settings-store";

const Settings = () => {
	const { data: sessionData } = authClient.useSession();
	const { data: profileData } = useProfile({ userId: sessionData?.user.id });
	const updateVisibility = useUpdateVisibility({
		viewerUserId: sessionData?.user.id ?? "",
	});

	const handleVisibilityChange = async (checked: boolean) => {
		await updateVisibility.mutateAsync({
			visibility: checked ? "private" : "public",
		});
	};

	const isSidebarGifGalleryEnabled = useSettingsStore(
		(state) => state.isSidebarGifGalleryEnabled
	);
	const setSidebarGifGalleryEnabled = useSettingsStore(
		(state) => state.setSidebarGifGalleryEnabled
	);

	const isSnowfallEnabled = useSettingsStore(
		(state) => state.isSnowfallEnabled
	);
	const setSnowfallEnabled = useSettingsStore(
		(state) => state.setSnowfallEnabled
	);

	const isBillboardEnabled = useSettingsStore(
		(state) => state.isBillboardEnabled
	);
	const setIsBillboardEnabled = useSettingsStore(
		(state) => state.setIsBillboardEnabled
	);

	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Settings" />
			<section className="flex flex-col gap-6 py-8 px-12">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-8">
						<h2 className="text-xl font-semibold">Profile</h2>

						<Field orientation="horizontal" className="w-full">
							<FieldContent>
								<FieldLabel
									htmlFor="profile-visibility"
									className="flex items-center gap-2 text-lg"
								>
									<HatGlasses className="size-5" />
									Private Profile
								</FieldLabel>
								<FieldDescription>
									Private profiles restrict post visibility to approved
									followers. Non-followers must request access to follow you.
								</FieldDescription>
							</FieldContent>
							<Switch
								id="profile-visibility"
								checked={profileData?.visibility === "private"}
								onCheckedChange={handleVisibilityChange}
								disabled={updateVisibility.isPending}
							/>
						</Field>
					</div>
				</div>
				<Separator />
				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">Personalization</h2>

					<div className="flex flex-col gap-8">
						<Field orientation="horizontal" className="w-full">
							<FieldContent>
								<FieldLabel
									htmlFor="sidebar-gif-gallery"
									className="flex items-center gap-2 text-lg"
								>
									<Sparkles className="size-5" />
									Sidebar Gif Gallery
								</FieldLabel>
								<FieldDescription>
									Toggle the visibility of the curated GIF gallery in the
									sidebar.
								</FieldDescription>
							</FieldContent>
							<Switch
								id="sidebar-gif-gallery"
								checked={isSidebarGifGalleryEnabled}
								onCheckedChange={setSidebarGifGalleryEnabled}
							/>
						</Field>
						<Field orientation="horizontal" className="w-full">
							<FieldContent>
								<FieldLabel
									htmlFor="snow-toggle"
									className="flex items-center gap-2 text-lg"
								>
									<Snowflake className="size-5" />
									Snow
								</FieldLabel>
								<FieldDescription>Let it snow.</FieldDescription>
							</FieldContent>
							<Switch
								id="snow-toggle"
								checked={isSnowfallEnabled}
								onCheckedChange={setSnowfallEnabled}
							/>
						</Field>
						<Field orientation="horizontal" className="w-full">
							<FieldContent>
								<FieldLabel
									htmlFor="snow-toggle"
									className="flex items-center gap-2 text-lg"
								>
									<Presentation className="size-5" />
									Billboard
								</FieldLabel>
								<FieldDescription>
									Show a live feed of daily trending posts in your sidebar.
								</FieldDescription>
							</FieldContent>
							<Switch
								id="snow-toggle"
								checked={isBillboardEnabled}
								onCheckedChange={setIsBillboardEnabled}
							/>
						</Field>
					</div>
				</div>
			</section>
		</main>
	);
};

export default Settings;
