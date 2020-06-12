import { ModuleCache } from "./module-cache.ts";
import { makeGetFullpath } from "./utils.ts";
import { assertEquals } from "./deps_test.ts";

const getFullpath = makeGetFullpath(import.meta.url);

Deno.test("module cache", async () => {
  let a = getFullpath("../example/a.ts");
  let b = getFullpath("../example/b.ts");
  const mcache = new ModuleCache();
  await mcache.preheat([a, b]);
  await mcache.reset([a]);
  // @ts-ignore
  let cachedModules: string[] = Object.keys(mcache.cache);
  assertEquals(cachedModules, [a]);
});
