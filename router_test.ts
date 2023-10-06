import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { UAPIRouter } from "./router.ts";
import { Hono } from "npm:hono";
import path from "node:path";

Deno.test("http test", async () => {
  const cases: [string, number, string | null][] = [
    ["/", 200, "home"],
    ["/foo", 200, "foo"],
    ["/foo/bar", 200, "bar"],
    ["/foo/rest", 200, "rest"],
    ["/foo/rest2", 200, "rest"],
    ["/foo/rest/bar", 200, "...rest"],
    ["/foo/rest2/bar", 200, "...rest"],
    ["/404", 404, null],
  ];

  const uapi = new UAPIRouter(path.resolve("./example"));
  const app = new Hono({ router: uapi });

  for (const [link, status, body] of cases) {
    const req = new Request(`http://127.0.0.1${link}`);
    const resp = await app.fetch(req);
    assertEquals(resp.status, status);
    if (body !== null) {
      const text = await resp.text();
      assertEquals(text, body);
    }
  }
});
