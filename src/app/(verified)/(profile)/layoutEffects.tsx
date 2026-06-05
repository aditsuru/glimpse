"use client";

import dynamic from "next/dynamic";

const MeteorsComponent = dynamic(
	() =>
		import("@/components/misc/MeteorsComponent").then(
			(m) => m.MeteorsComponent
		),
	{ ssr: false }
);

const Snowfall = dynamic(
	() => import("@/components/misc/Snowfall").then((m) => m.Snowfall),
	{ ssr: false }
);

export const LayoutEffects = () => {
	return (
		<>
			<Snowfall />
			<MeteorsComponent />
		</>
	);
};
