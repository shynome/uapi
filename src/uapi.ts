import { ServerRequest } from "./deps.ts";
import { Router } from "./router.ts";
import * as NotFoundModule from "./404.ts";
import { fillHost } from "./utils.ts";
import { moduleCache } from "./module-cache.ts";

/**api config. now nothing can be config */
export interface Config {}

export interface Handler {
  (req: ServerRequest): any;
}

export interface APIModule {
  default: Handler;
  config: Config;
}

export const buildHandler = (router: Router) => {
  return async (req: ServerRequest) => {
    let host = req.headers.get("host") || fillHost;
    let mpath = router.findModule(host, req.url);
    let module: APIModule = mpath === ""
      ? NotFoundModule
      : await moduleCache.import(mpath);
    if (typeof module.default !== "function") {
      module = NotFoundModule as any as APIModule;
    }
    let response = await module.default(req);
    if (req.w.buffered() === 0) {
      if (
        typeof response === "string" ||
        response instanceof Uint8Array ||
        typeof response.read === "function"
      ) {
        req.respond({ body: response });
      } else if (typeof response === "object") {
        req.respond(response);
      } else {
        req.respond({ status: 500, body: "bad logic way" });
      }
    }
  };
};
