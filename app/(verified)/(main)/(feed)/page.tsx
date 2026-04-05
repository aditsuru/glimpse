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
			"https://i.pinimg.com/736x/34/70/7c/34707c611749ddab412cad6991f6f2ae.jpg",
		authorIsVerified: true,
	},
	{
		id: "adwa",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "New desk setup finally done. The monitor arms made all the difference.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		attachments: [
			{
				fileUrl:
					"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
				fileType: "image" as const,
			},
		],
		hasUserLiked: true,
		hasUserBookmarked: true,
		likes: 521,
		comments: 34,
		bookmarks: 88,
		views: 6100,
		createdAt: new Date("2025-03-29T09:15:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
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
			"https://i.pinimg.com/736x/34/70/7c/34707c611749ddab412cad6991f6f2ae.jpg",
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
			"https://i.pinimg.com/736x/34/70/7c/34707c611749ddab412cad6991f6f2ae.jpg",
		authorIsVerified: true,
	},
	{
		id: "post_4",
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

		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 301,
		comments: 67,
		bookmarks: 44,
		views: 9230,
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/34/70/7c/34707c611749ddab412cad6991f6f2ae.jpg",
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
