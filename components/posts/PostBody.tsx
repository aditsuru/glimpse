"use client";

import { useEffect, useRef, useState } from "react";
import { renderPostContent } from "@/lib/post/renderPostContent";
import { Button } from "../ui/button";

export function PostBody({ content }: { content: string }) {
	const html = renderPostContent(content);

	const ref = useRef<HTMLDivElement>(null);
	const [clamped, setClamped] = useState(false);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		if (ref.current) {
			setClamped(ref.current.scrollHeight > ref.current.clientHeight);
		}
	}, []);

	return (
		<div>
			<div
				className="post-body"
				ref={ref}
				style={{ maxHeight: expanded ? "none" : "200px", overflow: "hidden" }}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: none
				dangerouslySetInnerHTML={{ __html: html }}
			/>
			{clamped && !expanded && (
				<Button variant="ghost" onClick={() => setExpanded(true)}>
					Read more
				</Button>
			)}
		</div>
	);
}
