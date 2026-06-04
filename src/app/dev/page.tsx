// app/(dev)/dev/notifications/page.tsx
import { NotificationCard } from "@/modules/notification/components/NotificationCard";

const makeActor = (username: string, n: number) => ({
	userId: `user-${username}-${n}`,
	username,
	displayName: username === "aditsuru" ? "Adit" : "Reze",
	isGlimpseVerified: username === "aditsuru",
	avatarUrl: `http://localhost:9000/glimpse-dev/avatars/seed/pfp-${n}.jpg`,
});

const adit = (n = 10) => makeActor("aditsuru", n);
const reze = (n = 15) => makeActor("reze", n);

const base = (overrides = {}) => ({
	id: Math.random().toString(36).slice(2),
	read: false,
	createdAt: new Date("2025-04-03T10:00:00Z"),
	updatedAt: new Date("2025-04-03T10:00:00Z"),
	...overrides,
});

const post = (withAttachment = false) => ({
	id: "post-1",
	body: "DENJI LOOK BEHIND!! this is a longer post body to test truncation behavior in the preview thumbnail",
	attachment: withAttachment
		? {
				mimeType: "image/jpeg",
				url: "http://localhost:9000/glimpse-dev/avatars/seed/pfp-12.jpg",
			}
		: null,
});

const notifications = [
	// ── LIKE ──────────────────────────────────────────────
	// 1 actor, unread
	{
		...base({ read: false }),
		type: "like" as const,
		postId: "post-1",
		actors: [adit(10)],
		actorCount: 1,
		post: post(true),
	},
	// 2 actors
	{
		...base({ read: true, updatedAt: new Date("2025-04-02T08:00:00Z") }),
		type: "like" as const,
		postId: "post-1",
		actors: [reze(15), adit(11)],
		actorCount: 2,
		post: post(true),
	},
	// 5 actors (max avatars)
	{
		...base({ read: true }),
		type: "like" as const,
		postId: "post-1",
		actors: [adit(10), reze(15), adit(12), reze(13), adit(14)],
		actorCount: 5,
		post: post(false),
	},
	// 21 actors (truncated)
	{
		...base({ read: false }),
		type: "like" as const,
		postId: "post-1",
		actors: [adit(10), reze(15), adit(16), reze(17), adit(18)],
		actorCount: 21,
		post: post(true),
	},

	// ── COMMENT ───────────────────────────────────────────
	// 1 actor, with body
	{
		...base({ read: false }),
		type: "comment" as const,
		postId: "post-1",
		commentId: "comment-1",
		actors: [reze(15)],
		actorCount: 1,
		body: "bro what is going on here lmaooo",
		post: post(true),
	},
	// 2 actors, with body (latest commenter's body shown)
	{
		...base({ read: true }),
		type: "comment" as const,
		postId: "post-1",
		commentId: "comment-2",
		actors: [adit(10), reze(15)],
		actorCount: 2,
		body: "this is wild actually",
		post: post(false),
	},
	// 50 actors — body should be null
	{
		...base({ read: false }),
		type: "comment" as const,
		postId: "post-1",
		commentId: "comment-3",
		actors: [reze(15), adit(10), reze(16), adit(17), reze(18)],
		actorCount: 50,
		body: null,
		post: post(true),
	},
	// 100+ actors — body null
	{
		...base({ read: true }),
		type: "comment" as const,
		postId: "post-1",
		commentId: "comment-4",
		actors: [adit(19), reze(20), adit(13), reze(14), adit(11)],
		actorCount: 128,
		body: null,
		post: post(false),
	},

	// ── COMMENT LIKE ──────────────────────────────────────
	// 1 actor, top-level comment (no parentCommentId)
	{
		...base({ read: false }),
		type: "comment_like" as const,
		postId: "post-1",
		commentId: "comment-1",
		parentCommentId: null,
		actors: [adit(10)],
		actorCount: 1,
	},
	// 1 actor, reply comment (has parentCommentId)
	{
		...base({ read: true }),
		type: "comment_like" as const,
		postId: "post-1",
		commentId: "comment-5",
		parentCommentId: "comment-1",
		actors: [reze(15)],
		actorCount: 1,
	},
	// 21 actors, reply
	{
		...base({ read: false }),
		type: "comment_like" as const,
		postId: "post-1",
		commentId: "comment-5",
		parentCommentId: "comment-1",
		actors: [adit(10), reze(15), adit(12), reze(13), adit(14)],
		actorCount: 21,
	},

	// ── FOLLOW ────────────────────────────────────────────
	// single follower
	{
		...base({ read: false }),
		type: "follow" as const,
		actors: [reze(15)],
		actorCount: 1,
	},
	// read follow
	{
		...base({ read: true, updatedAt: new Date("2025-04-01T12:00:00Z") }),
		type: "follow" as const,
		actors: [adit(10)],
		actorCount: 1,
	},

	// ── FOLLOW ACCEPT ─────────────────────────────────────
	{
		...base({ read: false }),
		type: "follow_accept" as const,
		actors: [reze(15)],
		actorCount: 1,
	},
	{
		...base({ read: true }),
		type: "follow_accept" as const,
		actors: [adit(10)],
		actorCount: 1,
	},

	// ── SYSTEM ────────────────────────────────────────────
	{
		...base({ read: false }),
		type: "system" as const,
		actors: [],
		actorCount: 0,
		body: "Welcome to Glimpse! Your account is now active.",
	},
	{
		...base({ read: true }),
		type: "system" as const,
		actors: [],
		actorCount: 0,
		body: "We've updated our terms of service. Please review the changes at your earliest convenience.",
	},
];

export default function DevNotificationsPage() {
	return (
		<div className="max-w-xl mx-auto py-8">
			<h1 className="text-xl font-bold px-4 mb-4">
				Notification Cards — Dev Preview
			</h1>
			<div className="border border-accent rounded-xl overflow-hidden">
				{notifications.map((n) => (
					<NotificationCard key={n.id} data={n} />
				))}
			</div>
		</div>
	);
}
