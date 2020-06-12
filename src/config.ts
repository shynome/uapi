import { RouteConfig } from "./router.ts";
import { basepath } from "./utils.ts";

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
  return rules;
}

export async function loadConfig(config_file: string) {
  config_file = new URL(config_file, basepath).pathname;
  let { mtime } = await Deno.stat(config_file);
  config_file = config_file + `?mtime=${mtime?.getTime()}`;
  let import_path = new URL(config_file, basepath).href;
  let config = (await import(import_path)).default;
  return config;
}
