"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import ProfileCard from "@/modules/profile/components/ProfileCard";
import { useSearchProfiles } from "@/modules/profile/profile.queries";

const Explore = () => {
	const [inputValue, setInputValue] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const { data, fetchNextPage, hasNextPage, isFetching } =
		useSearchProfiles(searchQuery);

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		setSearchQuery(inputValue);
	};

	const profiles = data?.pages.flatMap((page) => page.items) ?? [];

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit}>
				<div className="w-full flex justify-center p-4">
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
				</div>
			</form>

			<div className="flex flex-col gap-2">
				{profiles.map((profile) => (
					<Link
						href={`/${profile.username}`}
						key={profile.id}
						className="hover:bg-accent/20  px-4"
					>
						<ProfileCard data={profile} handleFollow={() => {}} viewerId="a" />
					</Link>
				))}

				{hasNextPage && (
					<Button
						onClick={() => fetchNextPage()}
						disabled={isFetching}
						className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
					>
						{isFetching ? "Loading..." : "Load more"}
					</Button>
				)}

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
