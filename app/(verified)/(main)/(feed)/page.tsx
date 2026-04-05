import PostCard from "@/components/posts/PostCard";

const mockPost = {
	id: "post_1",
	userId: "user_123",
	body: JSON.stringify({
		type: "doc",
		content: [
			// Plain paragraph with a mention and inline bold/italic
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Hey " },
					{
						type: "mention",
						attrs: { id: "usr_abc123", label: "janedoe" },
					},
					{ type: "text", text: " just shipped something wild — " },
					{
						type: "text",
						text: "read this carefully",
						marks: [{ type: "bold" }, { type: "italic" }],
					},
					{ type: "text", text: "." },
				],
			},

			// Paragraph with a real link mark (what tiptap stores when Link extension is active)
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Full writeup over at " },
					{
						type: "text",
						text: "https://github.com/aditsuru/glimpse",
						marks: [
							{
								type: "link",
								attrs: {
									href: "https://github.com/aditsuru/glimpse",
									target: "_blank",
									rel: "noopener noreferrer",
								},
							},
						],
					},
					{ type: "text", text: " — worth a read." },
				],
			},

			// Standalone URL — sole content node, text === href → becomes embed card
			{
				type: "paragraph",
				content: [
					{
						type: "text",
						text: "https://github.com/aditsuru/glimpse",
						marks: [
							{
								type: "link",
								attrs: {
									href: "https://github.com/aditsuru/glimpse",
									target: "_blank",
									rel: "noopener noreferrer",
								},
							},
						],
					},
				],
			},

			// Blockquote
			{
				type: "blockquote",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "The best code is the code you never have to write.",
							},
						],
					},
				],
			},

			// First code block — triggers segment split
			{
				type: "codeBlock",
				attrs: { language: "typescript" },
				content: [
					{
						type: "text",
						text: 'import { z } from "zod";\n\nconst UserSchema = z.object({\n  id: z.string().cuid2(),\n  username: z.string().min(3).max(32),\n  email: z.string().email(),\n});\n\ntype User = z.infer<typeof UserSchema>;',
					},
				],
			},

			// Paragraph after code block — tests that html segment resumes correctly
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "The schema above also works with " },
					{
						type: "text",
						text: "trpc",
						marks: [{ type: "code" }],
					},
					{ type: "text", text: " input validators directly. Shoutout to " },
					{
						type: "mention",
						attrs: { id: "usr_xyz789", label: "colinhacks" },
					},
					{ type: "text", text: " for zod." },
				],
			},

			// Bullet list
			{
				type: "bulletList",
				content: [
					{
						type: "listItem",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: "Zero runtime overhead" }],
							},
						],
					},
					{
						type: "listItem",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: "Full TypeScript inference" }],
							},
						],
					},
					{
						type: "listItem",
						content: [
							{
								type: "paragraph",
								content: [
									{ type: "text", text: "Composable and tree-shakeable" },
								],
							},
						],
					},
				],
			},

			// Second code block — tests multiple segment splits
			{
				type: "codeBlock",
				attrs: { language: "bash" },
				content: [
					{
						type: "text",
						text: "npm install zod\nnpx tsc --noEmit",
					},
				],
			},

			// Trailing paragraph — this is what gets cut by read-more
			{
				type: "paragraph",
				content: [
					{
						type: "text",
						text: "This trailing paragraph is intentionally long so the read-more threshold is crossed at a clean segment boundary. No code block should ever get sliced in half by the char limit logic — it always rounds up to the next complete segment before cutting.",
					},
				],
			},
		],
	}),
	hasAttachments: true,
	createdAt: new Date("2025-04-04T08:30:00Z"),
	attachments: [{ fileUrl: "/static/video.mp4", fileType: "video" as const }],
	hasUserLiked: false,
	hasUserBookmarked: true,
	likes: 142,
	comments: 38,
	bookmarks: 21,
	views: 4821,
	authorName: "Adi",
	authorUsername: "aditsuru",
	authorAvatarUrl:
		"https://i.pinimg.com/736x/ac/49/20/ac492039353e5db837ad6d8057fa9925.jpg", // will fallback to initials
	authorIsVerified: true,
};

function Home() {
	return (
		<div className="flex flex-col items-center justify-start pt-4 w-full min-h-full">
			<div className="flex flex-col justify-center items-center w-full gap-4">
				<p className="font-bold text-foreground flex justify-center">For you</p>
				<div className="h-[4px] bg-primary w-18"></div>
			</div>
			<div className="w-full border-t border-b px-2">
				<PostCard {...mockPost} />
			</div>
		</div>
	);
}

export default Home;
