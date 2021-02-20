import { Router, buildHandler } from "../src/mod.ts";
import { ResponseKind } from "../src/uapi.ts";
import { serve, assertEquals } from "./deps.ts";
import { makeGetFullpath } from "../src/utils.ts";

const getFullpath = makeGetFullpath(import.meta.url);

function preset() {
  const router = new Router("");
  const s = serve({ port: 0, hostname: "127.0.0.1" });
  // @ts-ignore
  const { port } = s.listener.addr;
  const baseurl = `http://127.0.0.1:${port}`;
  let handle = buildHandler(router);
  function fetchStatusCode(path: string) {
    return fetch(new URL(path, baseurl)).then(async (r) => {
      await r.text();
      return r.status;
    });
  }
  return { router, s, handle, baseurl, fetchStatusCode };
}

Deno.test({
  name: "uapi handler",
  fn: async () => {
    const { router, s, handle, fetchStatusCode } = preset();
    new Promise(async (rl) => {
      for await (const req of s) {
        handle(req);
      }
      // @ts-ignore
      rl();
    });
    try {
      const a = { path: "/a", module: getFullpath("../example/a.ts") };
      const b = { path: "/b", module: getFullpath("../example/b.ts") };
      await router.reload([a]);
      const a1 = await fetchStatusCode("/a");
      assertEquals(a1, 200);
      const b1 = await fetchStatusCode("/b");
      assertEquals(b1, 404);

      await router.reload([b]);
      const a2 = await fetchStatusCode("/a");
      assertEquals(a2, 404);

      const b2 = await fetchStatusCode("/b");
      assertEquals(b2, 200);
    } finally {
      s.close();
    }
  },
  sanitizeOps: false,
});
Deno.test({
  name: "uapi error api e",
  fn: async () => {
    const { router, s, handle, fetchStatusCode } = preset();
    try {
      const e = { path: "/e", module: getFullpath("../example/e.ts") };
      await router.reload([e]);
      let h = new Promise<boolean>(async (rl) => {
        for await (const req of s) {
          await handle(req).then((r) => rl(r.kind === ResponseKind.Error));
          break;
        }
      });
      let r = await fetchStatusCode("/e");
      assertEquals(r, 500);
      let hasError = await h;
      assertEquals(hasError, true);
    } finally {
      s.close();
    }
  },
  sanitizeOps: false,
});
Deno.test({
  name: "uapi error api f",
  fn: async () => {
    const { router, s, handle, fetchStatusCode } = preset();
    try {
      const e = { path: "/f", module: getFullpath("../example/f.ts") };
      await router.reload([e]);
      let h = new Promise<boolean>(async (rl) => {
        for await (const req of s) {
          await handle(req).then((r) => rl(r.kind === ResponseKind.Error));
          break;
        }
      });
      let r = await fetchStatusCode("/f");
      assertEquals(r, 500);
      let hasError = await h;
      assertEquals(hasError, true);
    } finally {
      s.close();
    }
  },
  sanitizeOps: false,
});
Deno.test({
  name: "uapi error api g",
  ignore: false,
  fn: async () => {
    const { router, s, handle, fetchStatusCode } = preset();
    try {
      const e = { path: "/g", module: getFullpath("../example/g.ts") };
      await router.reload([e]);
      let h = new Promise<boolean>(async (rl) => {
        for await (const req of s) {
          await handle(req).then((r) => rl(r.kind === ResponseKind.Error));
          break;
        }
      });
      let r = await fetchStatusCode("/g");
      assertEquals(r, 500);
      let hasError = await h;
      assertEquals(hasError, true);
    } finally {
      s.close();
    }
  },
  sanitizeOps: false,
});
