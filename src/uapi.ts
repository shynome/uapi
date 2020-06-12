import { ServerRequest, delay } from "./deps.ts";
import { Router } from "./router.ts";
import * as NotFoundModule from "./404.ts";
import { fillHost } from "./utils.ts";

/**api config. now nothing can be config */
export interface Config {
  /**api 超时时间, 设为 0 则不限制超时时间 */
  timeout?: number;
}

export interface Handler {
  (req: ServerRequest): any;
}

export interface APIModule {
  default: Handler;
  config: Config;
}

export enum ResponseKind {
  Normal,
  Timeout,
  Error,
}
export type Response = {
  kind: ResponseKind;
  value?: any;
};

export const buildHandler = (router: Router) => {
  return async (req: ServerRequest) => {
    let host = req.headers.get("host") || fillHost;
    let mpath = router.findModule(host, req.url);
    let module: APIModule = mpath === ""
      ? NotFoundModule
      : await router.mcache.import(mpath);
    if (typeof module.default !== "function") {
      module = NotFoundModule as any as APIModule;
    }

    let timeout = module?.config?.timeout || 10e3;

    let response: Response = await Promise.race([
      Promise.resolve()
        .then(async () => {
          return {
            kind: ResponseKind.Normal,
            value: await module.default(req),
          };
        })
        .catch(async (e) => {
          return {
            kind: ResponseKind.Error,
            value: e,
          };
        }),
      ...(timeout > 0
        ? [delay(timeout).then(() => ({ kind: ResponseKind.Timeout }))]
        : []),
    ]);

    if (req.w.buffered() !== 0) {
      return response;
    }
    switch (response.kind) {
      case ResponseKind.Timeout:
        req.respond({ status: 500, body: "api timeout" });
        break;
      case ResponseKind.Error:
        req.respond({ status: 500, body: "api throw error" });
        break;
      case ResponseKind.Normal:
        let value = response.value;
        if (
          typeof value === "string" ||
          value instanceof Uint8Array ||
          typeof value.read === "function"
        ) {
          req.respond({ body: value });
        } else if (
          typeof value === "object" &&
          ("body" in value || "status" in value)
        ) {
          req.respond(value);
        } else {
          req.respond({ status: 500, body: "bad logic way" });
        }
        break;
    }
    return response;
  };
};
