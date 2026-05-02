## Feature: Follows

What: Users can follow each other directly or via requests.

### DB

- follows table: followerId, followingId, status, createdAt, updatedAt

### Procedures (oRPC)

- profile.get({ userId }) → profile
- profile.update({ bio, avatar, ... }) → profile [auth required]
- profile.isUsernameAvailable({ username }) → boolean

### UI States

- Loading skeleton + Server Side hydration
- Own profile (shows edit button)
- Other user's profile (no edit button)
- Follow stats: NOT in this feature, stubbed as null/hidden

### Pages

- /{username}/follow → display followers and followings sections for the user
- /follow → See pending requests (sent and received)

### Constraints & Rules

- User must always request to follow a private profile
- All the three pages must follow cursor based pagination

### Out of Scope (conscious decisions)

- Notifications → Notification feature
