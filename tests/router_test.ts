import { Router } from "../src/mod.ts";
import { assertEquals } from "./deps.ts";
import { normalizePath } from "../src/utils.ts";

Deno.test("router", () => {
  const router = new Router("");
  const m1 = router.findModule("x", "");
  assertEquals(m1, "");
  const m2 = router.findModule("x", "s");
  assertEquals(m2, "");
});
Deno.test("router match", () => {
  const router = new Router("");
  router.reset([
    { path: "/a", module: "a" },
    { path: "/b", module: "b" },
    // match all path
    { path: "/c", module: "c1" },
    { path: "/c/**/*", module: "c2" },
    // globstar test
    { path: "/d*", module: "d" },
    // write first, match first
    { path: "/e/**/*", module: "e1" },
    { path: "/e/*", module: "e2" },
    { path: "/f/*", module: "f1" },
    { path: "/f/**/*", module: "f2" },
  ]);
  const testCases = [
    ["/a", "a"],
    ["/ab", ""],

    ["/b", "b"],

    ["/c", "c1"],
    ["/c/", "c2"],
    ["/c/ddw/fewq/feqwfqwef", "c2"],
    ["/c/ee", "c2"],

    ["/d", "d"],
    ["/dfewge", "d"],

    ["/e/eee", "e1"],
    ["/e/eee/ewf", "e1"],
    ["/e/", "e1"],

    ["/f/eee", "f1"],
    ["/f/ee/ewewf", "f2"],
  ];
  for (let [path, m] of testCases) {
    m = m === "" ? m : normalizePath(m);
    let m1 = router.findModule("x", path);
    assertEquals(m1, m);
  }
});
