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
import { Switch } from "@/components/ui/switch";

const Settings = () => {
	console.log(Switch);
	const [isPrivate, setIsPrivate] = useState(false);

	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar">
			<PageHeader title="Settings" />
			<section className="flex flex-col gap-8 py-8 px-12">
				<div className="flex items-center justify-between max-w-sm">
					<div>
						<p className="font-medium">Private Account</p>
						<p className="text-sm text-muted-foreground">description</p>
					</div>
					<Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
				</div>
			</section>
		</main>
	);
};

export default Settings;
