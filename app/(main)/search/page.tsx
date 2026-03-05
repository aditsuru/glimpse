"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SidebarSearch from "@/components/SidebarSearch";

function Search() {
	const router = useRouter();
	useEffect(() => {
		if (window.innerWidth >= 1024) {
			router.push("/");
		}
	}, [router]);

	return <SidebarSearch />;
}

export default Search;
