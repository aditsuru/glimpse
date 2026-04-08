/** biome-ignore-all lint/suspicious/noExplicitAny: none */
"use client";

import { useState } from "react";
import { RichEditor } from "@/primitives/editor/RichEditor";
import { RichRenderer } from "@/primitives/editor/RichRenderer";

function Dev() {
	const [editorJson, setEditorJson] = useState<any>(null);

	const handleUpdate = (output: { json: any; html: string; text: string }) => {
		// This is where you get your JSON
		console.log("JSON Output:", output.json);

		// Update your state
		setEditorJson(output.json);
	};

	return (
		<div className="w-screen h-screen flex justify-center gap-4 py-4">
			<RichEditor
				fetchMentionUsers={async () => [
					{
						id: "awd",
						username: "aditsuru",
						displayName: "Adi",
						avatarUrL: "/static/default-pfp.png",
					},
				]}
				onUpdate={handleUpdate}
			/>
			{editorJson && (
				<div className="max-w-lg">
					<RichRenderer content={editorJson} />
				</div>
			)}
		</div>
	);
}

export default Dev;
