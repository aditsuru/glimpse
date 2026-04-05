import PostCard from "@/components/posts/PostCard";

const mockPosts = [
	{
		id: "post_1",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Just pushed a massive refactor to the video player. Autoplay, autopause, scroll-driven lifecycle — all working cleanly now. Feels good.",
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
			"https://i.pinimg.com/736x/ac/49/20/ac492039353e5db837ad6d8057fa9925.jpg",
		authorIsVerified: true,
	},
	{
		id: "post_2",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Mita dropped something interesting. Worth watching if you're into generative stuff — short but dense.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		createdAt: new Date("2025-04-03T14:00:00Z"),
		attachments: [{ fileUrl: "/static/mia.mp4", fileType: "video" as const }],
		hasUserLiked: true,
		hasUserBookmarked: false,
		likes: 89,
		comments: 12,
		bookmarks: 7,
		views: 2103,
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/ac/49/20/ac492039353e5db837ad6d8057fa9925.jpg",
		authorIsVerified: true,
	},
	{
		id: "post_3",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Grok's latest is wild. Not sure how I feel about the direction but the output quality is undeniably sharp.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		createdAt: new Date("2025-04-02T09:15:00Z"),
		attachments: [{ fileUrl: "/static/grok.mp4", fileType: "video" as const }],
		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 301,
		comments: 67,
		bookmarks: 44,
		views: 9230,
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/ac/49/20/ac492039353e5db837ad6d8057fa9925.jpg",
		authorIsVerified: true,
	},
];

function Home() {
	return (
		<div className="flex flex-col items-center justify-start w-full min-h-full relative">
			<div className="flex flex-col justify-center items-center w-full gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 pt-4 border-b">
				<p className="font-bold text-foreground flex justify-center">For you</p>
				<div className="h-[4px] bg-primary w-18 rounded-t-md"></div>
			</div>
			<div className="w-full divide-y divide-border">
				{mockPosts.map((post) => (
					<div key={post.id} className="w-full px-2">
						<PostCard {...post} />
					</div>
				))}
			</div>
		</div>
	);
}

export default Home;
