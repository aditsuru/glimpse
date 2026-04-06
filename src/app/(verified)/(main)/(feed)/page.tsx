function Home() {
	return (
		<div className="flex flex-col items-center justify-start w-full min-h-full relative">
			<div className="flex flex-col justify-center items-center w-full gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 pt-4 border-b">
				<p className="font-bold text-foreground flex justify-center">For you</p>
				<div className="h-[4px] bg-primary w-18 rounded-t-md"></div>
			</div>
			<div className="w-full divide-y divide-border">{/* Feeds */}</div>
		</div>
	);
}

export default Home;
