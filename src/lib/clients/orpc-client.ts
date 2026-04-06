import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { config } from "@/lib/config";
import type { Router } from "@/server/router";

const link = new RPCLink({
	url: `${config.NEXT_PUBLIC_APP_URL}/api/rpc`,
});

export const client: RouterClient<Router> = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
