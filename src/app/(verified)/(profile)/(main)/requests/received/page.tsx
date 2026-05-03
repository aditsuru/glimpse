"use client";

import RequestsHeader from "../RequestsHeader";

const ReceivedPage = async () => {
	return (
		<main className="w-full overflow-y-auto no-scrollbar">
			<RequestsHeader />
			<div className="w-full h-full"></div>
		</main>
	);
};

export default ReceivedPage;
