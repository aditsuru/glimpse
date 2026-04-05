import type { OutputProfile } from "@/server/shared/schemas/profile";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileTabs } from "./ProfileTabs";

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
		<div className="flex flex-col">
			<ProfileBanner bannerUrl={bannerUrl} avatarUrl={avatarUrl} name={name} />

			<ProfileInfo
				name={name}
				username={username}
				bio={bio}
				website={website}
				followersCount={followersCount}
				followingsCount={followingsCount}
				isGlimpseVerified={isGlimpseVerified}
			/>

			<div className="mt-6">
				<ProfileTabs />
			</div>
		</div>
	);
}

export default Profile;
