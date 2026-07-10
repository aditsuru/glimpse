"use client";

import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { EmptyStateMessage } from "@/components/layout/EmptyStateMessage";
import { Loader } from "@/components/misc/Loader";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollContainer } from "@/components/VideoPlayer";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { FollowButton } from "@/modules/follow/components/FollowButton";
import { ProfileCard } from "@/modules/profile/components/ProfileCard";
import {
	useGetSuggestions,
	useSearchProfiles,
} from "@/modules/profile/profile.queries";
import { useViewerStore } from "@/store/use-viewer-store";

export default function Page() {
	const [inputValue, setInputValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const { userId } = useViewerStore();

	const {
		data: searchData,
		fetchNextPage,
		hasNextPage,
		isLoading: isSearchLoading,
		isFetching,
	} = useSearchProfiles(searchQuery);

	const { data: suggestionsData, isLoading: isSuggestionsLoading } =
		useGetSuggestions(searchQuery.length === 0);

	const ref = useInfiniteScroll(fetchNextPage, isFetching);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSearchQuery(inputValue);
	};

	const searchProfiles = searchData?.pages.flatMap((page) => page.items) ?? [];
	const suggestionProfiles = suggestionsData?.items ?? [];

	const isSearching = searchQuery.length > 0;

	return (
		<main className="flex flex-col w-full h-full overflow-hidden">
			<form
				onSubmit={handleSubmit}
				className="shrink-0 w-full flex justify-center px-4 py-4 border-b border-accent bg-background/80 backdrop-blur-sm z-10 h-18 items-center"
			>
				<InputGroup className="w-sm bg-background! rounded-full! p-4! py-5! has-[[data-slot=input-group-control]:focus-visible]:ring-0!">
					<InputGroupInput
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							if (e.target.value === "") setSearchQuery("");
						}}
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

			<ScrollContainer className="flex-1 overflow-y-auto no-scrollbar relative w-full">
				<div className="flex flex-col w-full pb-8">
					{isSearching ? (
						<>
							{searchProfiles.map((profile) => (
								<div
									key={profile.id}
									className="hover:bg-accent/20 px-4 flex items-center"
								>
									<ProfileCard data={profile} />
									{profile.userId !== userId && (
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

							{isSearchLoading && (
								<div className="py-8 flex justify-center w-full">
									<Loader />
								</div>
							)}

							{hasNextPage && (
								<div ref={ref} className="py-8 flex justify-center w-full">
									{isFetching && <Loader />}
								</div>
							)}

							{searchProfiles.length === 0 && !isSearchLoading && (
								<div className="mt-16">
									<EmptyStateMessage
										title={`No profiles found for "${searchQuery}"`}
									/>
								</div>
							)}
						</>
					) : (
						<>
							{suggestionProfiles.length > 0 && (
								<div className="px-6 py-4 text-xl font-semibold">
									Suggested Accounts
								</div>
							)}

							{suggestionProfiles.map((profile) => (
								<div
									key={profile.id}
									className="hover:bg-accent/20 px-4 flex items-center"
								>
									<ProfileCard data={profile} />
									{profile.userId !== userId && (
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

							{isSuggestionsLoading && (
								<div className="py-8 flex justify-center w-full">
									<Loader />
								</div>
							)}

							{!isSuggestionsLoading && suggestionProfiles.length === 0 && (
								<div className="mt-24">
									<EmptyStateMessage
										Icon={Sparkles}
										title="You're popular!"
										description="You somehow follow literally everyone on the platform. Go touch some grass."
									/>
								</div>
							)}
						</>
					)}
				</div>
			</ScrollContainer>
		</main>
	);
}
