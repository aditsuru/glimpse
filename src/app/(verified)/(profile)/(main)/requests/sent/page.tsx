"use client";

import RequestsHeader from "../RequestsHeader";

const SentPage = () => {
	return (
		<main className="w-full h-full overflow-y-auto no-scrollbar flex flex-col">
			<RequestsHeader />
			<div className="flex-1"></div>
		</main>
	);
};

export default SentPage;
