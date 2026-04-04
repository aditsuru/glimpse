import { VideoPlayer } from "@/components/media/VideoPlayer";
import PostCard from "@/components/posts/PostCard";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const mockPost = {
	id: "post_1",
	userId: "user_123",
	body: JSON.stringify({
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Just shipped " },
					{ type: "text", text: "v2.0", marks: [{ type: "bold" }] },
					{ type: "text", text: " of our platform — here's what's new 🧵" },
				],
			},
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Big shoutout to " },
					{
						type: "mention",
						attrs: { id: "user_456", label: "adityachandra" },
					},
					{ type: "text", text: " and " },
					{ type: "mention", attrs: { id: "user_789", label: "rahulsharma" } },
					{ type: "text", text: " for pulling this off 🙌" },
				],
			},
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Performance is " },
					{ type: "text", text: "3x faster", marks: [{ type: "bold" }] },
					{ type: "text", text: " and the new " },
					{ type: "text", text: "search", marks: [{ type: "italic" }] },
					{ type: "text", text: " is finally " },
					{
						type: "text",
						text: "actually good",
						marks: [{ type: "bold" }, { type: "italic" }],
					},
					{ type: "text", text: "." },
				],
			},
			{
				type: "paragraph",
				content: [
					{ type: "text", text: "Check the full changelog at " },
					{
						type: "text",
						text: "github.com/org/repo",
						marks: [{ type: "link", attrs: { href: "https://github.com" } }],
					},
				],
			},
			{
				type: "paragraph",
				content: [{ type: "text", text: "Code snippet for the new API:" }],
			},
			{
				type: "codeBlock",
				attrs: { language: "typescript" },
				content: [
					{
						type: "text",
						text: "const res = await fetch('/api/v2/posts')\nconst data = await res.json()",
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
	authorName: "Aditya Chandra",
	authorUsername: "adityachandra",
	authorAvatarUrl: "null", // will fallback to initials
	authorIsVerified: true,
};

function Home() {
	return (
		<div className="h-full w-full flex justify-center items-center">
			<PostCard {...mockPost} />
		</div>
	);
}

export default Home;
