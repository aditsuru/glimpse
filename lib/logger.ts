import pino from "pino";
import { config } from "./config";

export const logger = pino({
	level: config.NODE_ENV === "production" ? "info" : "debug",
	transport:
		config.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});
