import { accountRouter } from "@/modules/account/account.route";
import { bookmarkRouter } from "@/modules/bookmark/bookmark.route";
import { commentRouter } from "@/modules/comment/comment.route";
import { commentLikeRouter } from "@/modules/comment-like/comment-like.route";
import { dmcaRouter } from "@/modules/dmca/dmca.route";
import { followRouter } from "@/modules/follow/follow.route";
import { notificationRouter } from "@/modules/notification/notification.route";
import { postRouter } from "@/modules/post/post.route";
import { postLikeRouter } from "@/modules/post-like/post-like.route";
import { profileRouter } from "@/modules/profile/profile.route";
import { reportRouter } from "@/modules/report/report.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
	follow: followRouter,
	post: postRouter,
	postLike: postLikeRouter,
	commentLike: commentLikeRouter,
	bookmark: bookmarkRouter,
	comment: commentRouter,
	account: accountRouter,
	notification: notificationRouter,
	report: reportRouter,
	dmca: dmcaRouter,
});

export type Router = typeof router;
