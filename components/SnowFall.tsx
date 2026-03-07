"use client";
import Snowfall from "react-snowfall";
import { useUIStore } from "@/stores/useUIStore";

function SnowFall() {
	const snowfall = useUIStore((state) => state.snowfall);
	return <div>{snowfall && <Snowfall />}</div>;
}

export default SnowFall;
