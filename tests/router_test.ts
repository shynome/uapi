import { Router } from "../src/mod.ts";
import { assertEquals } from "./deps.ts";
import { normalizePath, makeGetFullpath } from "../src/utils.ts";
const getFullpath = makeGetFullpath(import.meta.url);

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

const a = { path: "/a", module: getFullpath("../example/a.ts") };
const b = { path: "/b", module: getFullpath("../example/b.ts") };
const c = { path: "/c", module: getFullpath("../example/c.ts") };
const d = { path: "/d", module: getFullpath("../example/d.ts") };

Deno.test("router reload ", async () => {
  const router = new Router("");
  await Promise.all([
    router.reload([a, b]),
    router.reload([a]),
  ]);
  const m1 = router.findModule("x", "/b");
  assertEquals(m1, "");
  const m2 = router.findModule("x", "/a");
  assertEquals(m2, a.module);

  // case reload fail
  const r = await router.reload([c]).then(() => 0, () => 1);
  assertEquals(r, 1);
  const m3 = router.findModule("x", "/c");
  const m4 = router.findModule("x", "/a");
  assertEquals(m3, "");
  assertEquals(m4, a.module);
});
Deno.test("router reload fail", async () => {
  const router = new Router("");
  await router.reload([a]);

  // case reload fail
  const r = await router.reload([c]).then(() => 0, () => 1);
  assertEquals(r, 1);
  const m3 = router.findModule("x", "/c");
  const m4 = router.findModule("x", "/a");
  assertEquals(m3, "");
  assertEquals(m4, a.module);
});
Deno.test({
  name: "router reload fail when module dynamic import a wrong path",
  ignore: true,
  fn: async () => {
    const router = new Router("");
    await router.reload([a]);

    // case reload fail
    const r = await router.reload([d]).then(() => 0, () => 1);
    assertEquals(r, 1);
    const m3 = router.findModule("x", "/d");
    const m4 = router.findModule("x", "/a");
    assertEquals(m3, "");
    assertEquals(m4, a.module);
  },
});
