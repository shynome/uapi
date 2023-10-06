import { Context } from "npm:hono";
import { getHandler } from "./serve.ts";
import path from "node:path";
import { HTTPException } from "npm:hono/http-exception";

export class UAPIRouter {
  constructor(public rootdir: string) {}
  name = "uapi";
  // @ts-expect-error todo
  add(_method, _path, _handler): void {}
  match = (_method: string, _path: string) => {
    return {
      handlers: [this.handle],
      params: {},
    };
  };
  handle = (c: Context) => {
    return this.fetch(c.req.raw);
  };
  fetch = async (req: Request) => {
    const u = new URL(req.url);
    const p = path.join(this.rootdir, u.pathname);
    const h = await getHandler(p);
    if (h === null) {
      throw new HTTPException(404, { message: "no handler" });
    }
    return h.fetch(req);
  };
}

export default UAPIRouter;
