import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/shared/auth";

export const { POST, GET } = toNextJsHandler(auth);
