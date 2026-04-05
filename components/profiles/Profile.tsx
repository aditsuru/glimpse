import type { PostOutput } from "@/server/shared/schemas/post";
import type { OutputProfile } from "@/server/shared/schemas/profile";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileTabs } from "./ProfileTabs";

const mockData: PostOutput[] = [
	// Text only
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
							text: "Just shipped v2 of the auth system. Took way longer than expected but the DX is finally where I want it. Shoutout to ",
						},
						{ type: "mention", attrs: { id: "usr_abc", label: "colinhacks" } },
						{
							type: "text",
							text: " for zod making validation actually enjoyable.",
						},
					],
				},
			],
		}),
		hasAttachments: false,
		attachments: [],
		hasUserLiked: true,
		hasUserBookmarked: false,
		likes: 284,
		comments: 12,
		bookmarks: 47,
		views: 3200,
		createdAt: new Date("2025-04-03T10:00:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
		authorIsVerified: true,
	},

	// Long text — triggers read more
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
							text: "Hot take: most startups fail not because of bad technology but because of bad prioritization. Engineers optimize for things that don't matter at scale because they're building for a scale they haven't reached yet. You don't need a distributed queue for 200 users. You need something that ships. The best architecture is the one that lets you move fast enough to find out if the product even matters. Premature optimization isn't just a code smell — it's a business risk.",
						},
					],
				},
			],
		}),
		hasAttachments: false,
		attachments: [],
		hasUserLiked: false,
		hasUserBookmarked: true,
		likes: 1900,
		comments: 203,
		bookmarks: 412,
		views: 28000,
		createdAt: new Date("2025-04-01T14:22:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
		authorIsVerified: true,
	},

	// Single image
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

	// Multiple images — tests the grid
	{
		id: "post_4",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [{ type: "text", text: "Bangalore last weekend." }],
				},
			],
		}),
		hasAttachments: true,
		attachments: [
			{
				fileUrl:
					"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800",
				fileType: "image" as const,
			},
			{
				fileUrl:
					"https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
				fileType: "image" as const,
			},
			{
				fileUrl:
					"https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
				fileType: "image" as const,
			},
			{
				fileUrl:
					"https://images.unsplash.com/photo-1529111290557-82f6d5c6cf85?w=800",
				fileType: "image" as const,
			},
		],
		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 743,
		comments: 56,
		bookmarks: 102,
		views: 9400,
		createdAt: new Date("2025-03-25T18:30:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
		authorIsVerified: true,
	},

	// Media only — no body text
	{
		id: "post_5",
		userId: "user_123",
		body: undefined,
		hasAttachments: true,
		attachments: [
			{
				fileUrl:
					"https://i.pinimg.com/originals/e4/1d/5e/e41d5e91c040869cb3d0c15e1e46c322.gif",
				fileType: "image" as const,
			},
		],
		hasUserLiked: false,
		hasUserBookmarked: false,
		likes: 198,
		comments: 7,
		bookmarks: 23,
		views: 2100,
		createdAt: new Date("2025-03-20T11:00:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
		authorIsVerified: true,
	},

	// Video — tests the play overlay
	{
		id: "post_6",
		userId: "user_123",
		body: JSON.stringify({
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Demo of the new composer. Still rough around the edges.",
						},
					],
				},
			],
		}),
		hasAttachments: true,
		attachments: [{ fileUrl: "/static/grok.mp4", fileType: "video" as const }],
		hasUserLiked: true,
		hasUserBookmarked: false,
		likes: 632,
		comments: 44,
		bookmarks: 71,
		views: 8800,
		createdAt: new Date("2025-03-15T16:45:00Z"),
		authorName: "Aditya Chandra",
		authorUsername: "adityachandra",
		authorAvatarUrl:
			"https://i.pinimg.com/474x/5a/71/68/5a716836387145194b529e131e648acb.jpg",
		authorIsVerified: true,
	},
];

function Profile({
	avatarUrl,
	bannerUrl,
	bio,
	followersCount,
	followingsCount,
	isGlimpseVerified,
	name,
	username,
	website,
}: OutputProfile) {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="shrink-0">
				<ProfileBanner
					bannerUrl={bannerUrl}
					avatarUrl={avatarUrl}
					name={name}
				/>
				<ProfileInfo
					name={name}
					username={username}
					bio={bio}
					website={website}
					followersCount={followersCount}
					followingsCount={followingsCount}
					isGlimpseVerified={isGlimpseVerified}
				/>
			</div>

			<div className="flex flex-col flex-1 overflow-hidden mt-6 w-full">
				<ProfileTabs posts={mockData} />
			</div>
		</div>
	);
}

export default Profile;
