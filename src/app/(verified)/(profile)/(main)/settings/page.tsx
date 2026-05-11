"use client";

import {
	HatGlasses,
	MoonStar,
	Presentation,
	Snowflake,
	Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
	useProfile,
	useUpdateVisibility,
} from "@/modules/profile/profile.queries";
import { useSettingsStore } from "@/store/use-settings-store";
import { useViewerStore } from "@/store/use-viewer-store";

export default function Page() {
	const viewerData = useViewerStore((state) => state);

	const { data: profileData } = useProfile({ userId: viewerData.userId });
	const updateVisibility = useUpdateVisibility({
		viewerUserId: viewerData.userId,
	});

	const handleVisibilityChange = async (checked: boolean) => {
		await updateVisibility.mutateAsync({
			visibility: checked ? "private" : "public",
		});
	};

	const {
		isSidebarGifGalleryEnabled,
		setSidebarGifGalleryEnabled,
		isSnowfallEnabled,
		setSnowfallEnabled,
		isBillboardEnabled,
		setIsBillboardEnabled,
		isMeteorsEnabled,
		setIsMeteorsEnabled,
	} = useSettingsStore();

	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Settings" />
			<section className="flex flex-col gap-6 py-8 px-12">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-4">
						<h2 className="text-xl font-semibold">Profile </h2>

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
					<div>
						<h2 className="text-xl font-semibold">Personalization</h2>
						<p className="text-destructive md:hidden">
							Some of these options are only effective on desktop devices
						</p>
					</div>
					<div className="flex flex-col gap-6">
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
									htmlFor="billboard"
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
								id="billboard"
								checked={isBillboardEnabled}
								onCheckedChange={setIsBillboardEnabled}
							/>
						</Field>
						<Field orientation="horizontal" className="w-full">
							<FieldContent>
								<FieldLabel
									htmlFor="meteors"
									className="flex items-center gap-2 text-lg"
								>
									<MoonStar className="size-5" />
									Meteors
								</FieldLabel>
								<FieldDescription>Start a meteor shower.</FieldDescription>
							</FieldContent>
							<Switch
								id="meteors"
								checked={isMeteorsEnabled}
								onCheckedChange={setIsMeteorsEnabled}
							/>
						</Field>
					</div>
				</div>
			</section>
		</main>
	);
}
