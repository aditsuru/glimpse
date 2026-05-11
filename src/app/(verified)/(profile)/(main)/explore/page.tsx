"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import { useSearchProfiles } from "@/modules/profile/profile.queries";
import { useViewerStore } from "@/store/use-viewer-store";

export default function Page() {
	const [inputValue, setInputValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const viewerData = useViewerStore.getState();
	const { data, fetchNextPage, hasNextPage, isFetching } =
		useSearchProfiles(searchQuery);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSearchQuery(inputValue);
	};

	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<form
				onSubmit={handleSubmit}
				className="sticky top-0 w-full flex justify-center px-4 py-4 border-b border-accent bg-background/80 backdrop-blur-sm z-10 h-18 items-center"
			>
				<InputGroup className="w-sm bg-background! rounded-full! p-4! py-5! has-[[data-slot=input-group-control]:focus-visible]:ring-0!">
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

			<div className="flex flex-col flex-1">
				{profiles.map((profile) => (
					<div
						key={profile.id}
						className="hover:bg-accent/20 px-4 flex items-center"
					>
						<ProfileCard data={profile} />

						{profile.userId !== viewerData.userId && (
							<FollowButton
								initialStatus={profile.viewerStatus}
								targetUserId={profile.userId}
								targetUsername={profile.username}
								targetVisibility={profile.visibility}
								className="mr-4"
							/>
						)}
					</div>
				))}
				{hasNextPage && <div ref={ref} className="h-1" />}
				{searchQuery && profiles.length === 0 && !isFetching && (
					<div className="flex-1">
						<EmptyStateMessage
							title={`No profiles found for "${searchQuery}"`}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
