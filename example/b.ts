import { ServerRequest } from "https://deno.land/std@0.56.0/http/server.ts";

export default (req: ServerRequest) => {
  req.respond({ body: "bbbb" });
};
