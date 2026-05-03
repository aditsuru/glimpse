"use client";

import { HatGlasses } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/use-settings-store";

const Settings = () => {
	const [isPrivate, setIsPrivate] = useState(false);

	const issidebarGifGalleryEnabled = useSettingsStore(
		(state) => state.issidebarGifGalleryEnabled
	);
	const setsidebarGifGalleryEnabled = useSettingsStore(
		(state) => state.setsidebarGifGalleryEnabled
	);

	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Settings" />
			<section className="flex flex-col gap-8 py-8 px-12">
				<div className="flex flex-col gap-4">
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
								Private profiles restrict post visibility to approved followers.
								Non-followers must request access to follow you.
							</FieldDescription>
						</FieldContent>
						<Switch
							id="profile-visibility"
							checked={isPrivate}
							onCheckedChange={setIsPrivate}
						/>
					</Field>
				</div>
				<Separator />
				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">Others</h2>

					<Field orientation="horizontal" className="w-full">
						<FieldContent>
							<FieldLabel
								htmlFor="sidebar-gif-panel"
								className="flex items-center gap-2 text-lg"
							>
								Sidebar Gif Panel
							</FieldLabel>
							<FieldDescription>
								Toggle the visibility of the curated GIF gallery in the sidebar.
							</FieldDescription>
						</FieldContent>
						<Switch
							id="sidebar-gif-panel"
							checked={issidebarGifGalleryEnabled}
							onCheckedChange={setsidebarGifGalleryEnabled}
						/>
					</Field>
				</div>
			</section>
		</main>
	);
};

export default Settings;
