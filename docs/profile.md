## Feature: Profiles

What: Users have a profile created on signup. Viewable by others.

### DB

- profiles table: id, userId, username, displayName, isGlimpseVerified, bio, pronouns, avatarKey, bannerKey, visibility, createdAt, updatedAt

### Procedures (oRPC)

- profiles.get({ userId }) → profile
- profiles.update({ bio, avatar, ... }) → profile [auth required]
- profiles.isUsernameAvailable({ username }) → boolean

### UI States

- Loading skeleton
- Own profile (shows edit button)
- Other user's profile (no edit button)
- Follow stats: NOT in this feature, stubbed as null/hidden

### Pages

- Profile sidebar in home
- Profile view (/{username})

### Out of Scope (conscious decisions)

- Follow counts on profile page → Follow feature

### Utility needed

- AWS S3 helper functions
