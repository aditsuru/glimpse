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
							text: "Idk why I love this trend.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		createdAt: new Date("2024-04-04T08:30:00Z"),
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
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
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
					"https://i.pinimg.com/736x/8a/45/9a/8a459a682d6bfdcc22b41ec90bfb69a6.jpg",
				fileType: "image" as const,
			},
		],
		hasUserLiked: true,
		hasUserBookmarked: true,
		likes: 521,
		comments: 34,
		bookmarks: 88,
		views: 6100,
		createdAt: new Date("2026-03-29T09:15:00Z"),
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
		authorIsVerified: true,
	},
	{
		id: "awdwaw",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Kind Mita wants you",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		attachments: [
			{
				fileUrl: "https://i.redd.it/q5yjyt8ijmbf1.png",
				fileType: "image" as const,
			},
		],
		hasUserLiked: true,
		hasUserBookmarked: true,
		likes: 521,
		comments: 34,
		bookmarks: 88,
		views: 6100,
		createdAt: new Date("2026-02-29T09:15:00Z"),
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
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
							text: "Mita obsessed",
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
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
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
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
		authorIsVerified: true,
	},
	{
		id: "post_awdadwada3",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "New rice.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		createdAt: new Date("2025-04-02T09:15:00Z"),
		attachments: [
			{
				fileUrl:
					"https://preview.redd.it/aerospace-i-thought-id-miss-arch-v0-8bk9g5w3vowf1.png?width=1080&crop=smart&auto=webp&s=5262176261ac8c8744fff490216bc3b79bea5333",
				fileType: "image" as const,
			},
			{
				fileUrl:
					"https://preview.redd.it/aerospace-i-thought-id-miss-arch-v0-hzbbczs4vowf1.png?width=1080&crop=smart&auto=webp&s=fa035ee99c67c171b2ef79577e4b18a97eafa671",
				fileType: "image" as const,
			},
		],
		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 301,
		comments: 67,
		bookmarks: 44,
		views: 9230,
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
		authorIsVerified: true,
	},
	{
		id: "post_4",
		userId: "user_123",
		hasAttachments: true,
		createdAt: new Date("2025-04-02T09:15:00Z"),
		attachments: [
			{ fileUrl: "/static/miside.mp4", fileType: "video" as const },
		],
		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 301,
		comments: 67,
		bookmarks: 44,
		views: 9230,
		authorName: "Adi",
		authorUsername: "aditsuru",
		authorAvatarUrl:
			"https://i.pinimg.com/736x/d8/02/12/d802123602dfec846c6a70416266fd27.jpg",
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
