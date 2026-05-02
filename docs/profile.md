## Feature: Profiles

What: Users have a profile created on signup. Viewable by others.

### DB

- profiles table: id, userId, username, displayName, isGlimpseVerified, bio, pronouns, avatarKey, bannerKey, visibility, createdAt, updatedAt

### Procedures (oRPC)

- profile.get({ userId }) → profile
- profile.update({ bio, avatar, ... }) → profile [auth required]
- profile.isUsernameAvailable({ username }) → boolean

### UI States

- Loading skeleton
- Own profile (shows edit button)
- Other user's profile (no edit button)
- Follow stats: NOT in this feature, stubbed as null/hidden

### Pages

- Profile sidebar in home
- Profile view (/{username})

### Constraints & Rules

- Avatar and Banner urls might be undefined, fallback defined in `constants.ts` must always be used
- Bio and pronouns can be empty strings - Forms, Validation and DB schema must accept it.

### Out of Scope (conscious decisions)

- Follow counts on profile page → Follow feature

### Utility needed

- AWS S3 helper functions
