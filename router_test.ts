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
    // [rest]
    ["/rest", 200, "rest"],
    ["/rest/foo", 200, "rest"],
    ["/rest/foo/bar", 404, null],
    // [...rest]
    ["/rest-all", 200, "rest all"],
    ["/rest-all/foo", 200, "rest all"],
    ["/rest-all/foo/bar", 200, "rest all"],
    // mix [rest] [...rest]
    ["/rest-mix", 200, "rest"],
    ["/rest-mix/foo", 200, "rest"],
    ["/rest-mix/foo/bar", 200, "rest all"],
    // hono
    ["/hono", 404, null],
    ["/hono/hello", 200, "hello world"],
    ["/hono/hello/who?name=shynome", 200, "hello shynome"],
    ["/hono/foo", 404, null],
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
