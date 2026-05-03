"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { authClient } from "@/lib/client/auth-client";
import FollowButton from "@/modules/follow/components/FollowButton";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import { useSearchProfiles } from "@/modules/profile/profile.queries";

const Explore = () => {
	const [inputValue, setInputValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const { data: sessionData } = authClient.useSession();
	const { data, fetchNextPage, hasNextPage, isFetching } =
		useSearchProfiles(searchQuery);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSearchQuery(inputValue);
	};

	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="w-full h-full overflow-y-auto no-scrollbar">
			<form
				onSubmit={handleSubmit}
				className="sticky top-0 w-full flex justify-center px-4 py-3 border-b border-accent bg-background/80 backdrop-blur-sm z-10"
			>
				<InputGroup className="w-sm bg-background! rounded-full! p-4! py-5!">
					<InputGroupInput
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Search profiles..."
						autoComplete="off"
						className="text-base!"
					/>
					<InputGroupAddon className="mr-1!">
						<button type="submit">
							<Search className="size-4" />
						</button>
					</InputGroupAddon>
				</InputGroup>
			</form>

			<div className="flex flex-col">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="hover:bg-accent/20 px-4 flex items-center"
					>
						<Link href={`/${profile.username}`} className="flex-1">
							<ProfileCard data={profile} />
						</Link>
						{profile.userId !== sessionData?.user.id && (
							<FollowButton
								initialStatus={profile.viewerStatus}
								targetUserId={profile.userId}
								targetVisibility={profile.visibility}
								className="mr-4"
							/>
						)}
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{searchQuery && profiles.length === 0 && !isFetching && (
					<p className="text-center text-muted-foreground text-base py-8">
						No profiles found for "{searchQuery}"
					</p>
				)}
			</div>
		</div>
	);
};

export default Explore;
