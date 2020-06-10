import { RouteConfig } from "./router.ts";
import { basedir, normalizePath } from "./utils.ts";

interface RouteItem {
  path: string;
  module: string;
}

export function parseConfig(config: RouteConfig, basepath: string = "") {
  let rules: RouteItem[] = [];
  for (let k in config) {
    let val = config[k];
    if (typeof val === "string") {
      let item = { path: basepath + k, module: val };
      rules.push(item);
    } else if (typeof val === "object") {
      let currentBasepath = basepath + k;
      let items = parseConfig(val, currentBasepath);
      rules = rules.concat(...items);
    } else {
      continue;
    }
  }
  rules = rules.map((r) => {
    r.module = normalizePath(r.module);
    return r;
  });
  return rules;
}

export async function loadConfig(config_file: string) {
  config_file = new URL(config_file, basedir).pathname;
  let { mtime } = await Deno.stat(config_file);
  config_file = config_file + `?mtime=${mtime?.getTime()}`;
  let import_path = new URL(config_file, basedir).href;
  let config = (await import(import_path)).default;
  return config;
}
