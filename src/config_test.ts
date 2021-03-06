import { parseConfig, loadConfig } from "./config.ts";
import { assertEquals } from "../tests/deps.ts";
import config from "./config_test.uapi.map.ts";

Deno.test("normalizeConfig", () => {
  let c = parseConfig(config);
  let e = [
    { path: "/a", module: "a" },
    { path: "localhost/a/", module: "la" },
    { path: "localhost/a/b", module: "lab" },
    { path: "localhost/a/a", module: "laa" },
    { path: "/b/a", module: "ba" },
    { path: "/b/b", module: "bb" },
  ];
  assertEquals(c, e);
});

Deno.test("loadConfig", async () => {
  let testConfigFilepath = new URL("./config_test.uapi.map.ts", import.meta.url)
    .href;
  let c = await loadConfig(testConfigFilepath);
  assertEquals(c, config);
});
