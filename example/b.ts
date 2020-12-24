import type { ServerRequest } from "https://deno.land/std/http/server.ts";

export default (req: ServerRequest) => {
  req.respond({ body: "bbbb" });
};
