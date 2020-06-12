import { serve } from "https://deno.land/std@0.56.0/http/server.ts";
import { Router, buildHandler } from "./src/mod.ts";

let port = Deno.env.get("PORT") || "8000";
let config_filepath = Deno.env.get("CONF_PATH") || "uapi.config.ts";

const s = serve({ port: Number(port) });

const router = new Router(config_filepath);
router.watchConfigFile();
const handle = buildHandler(router);

await router.init();
console.log(`http://localhost:${port}/`);

for await (const req of s) {
  handle(req);
}
