## Feature: Follows

What: Users can follow each other. Private profiles require approval.

### DB

- follows table: followerId, followingId, status, createdAt, updatedAt
- status enum: pending | accepted
- Unique constraint on (followerId, followingId)
- Index on followerId, index on followingId

### Procedures (oRPC)

- follow.send({ targetUserId }) → { success: true }
- follow.remove({ targetUserId }) → { success: true } — unfollow or cancel request
- follow.removeFollower({ followerId }) → { success: true }
- follow.accept({ followerId }) → { success: true }
- follow.reject({ followerId }) → { success: true }
- follow.getStatus({ targetUserId }) → { status: "none" | "pending" | "accepted" | "follows_you" | "mutual" }
- follow.getFollowers({ userId, cursor? }) → { items: Profile[], nextCursor: Date | null }
- follow.getFollowing({ userId, cursor? }) → { items: Profile[], nextCursor: Date | null }
- follow.getPendingReceived({ cursor? }) → { items: Profile[], nextCursor: Date | null }
- follow.getPendingSent({ cursor? }) → { items: Profile[], nextCursor: Date | null }

### Constraints & Rules

- Private profiles always require a follow request regardless of who is asking
- A user cannot follow themselves — enforced at service level and DB check constraint
- status: pending = waiting for approval, accepted = following
- Unfollowing removes the row entirely, not a status change
- Removing a follower removes their row entirely

### UI States

- Follow button states: Follow | Requested | Following | Follow Back
- Follow Back shown when target already follows the viewer but viewer doesn't follow back
- Following profile: clicking shows "Unfollow" on hover
- No follow button on own profile
- Pending requests page shows sent and received in separate tabs
- Followers page has remove option (three dots) per follower

### Pages

- /{username}/followers — paginated followers list
- /{username}/following — paginated following list
- /requests — pending sent and received follow requests

### Out of Scope

- Blocking users
- Notifications (separate feature)
- Follow counts on profile (stubbed as 0, unblocked by this feature)
