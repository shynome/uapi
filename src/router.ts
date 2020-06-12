import { loadConfig, parseConfig } from "./config.ts";
import { globToRegExp } from "./deps.ts";
import { normalizePath, fillHost } from "./utils.ts";
import { moduleCache } from "./module-cache.ts";

export interface RouteConfig {
  [path: string]: string | RouteConfig;
}

export interface RouteRule {
  regexp: RegExp;
  module: string;
}

export const NotFoundModule = new URL("./", import.meta.url);

type Rules = { [host: string]: RouteRule[] };

export class Router {
  constructor(private config_path: string, private mcache = moduleCache) {}
  private version = 0;
  public rules: Rules = {};
  public reload = async () => {
    const currentCommitVersion = this.version + 1;
    this.version = currentCommitVersion;
    let config = await loadConfig(this.config_path);
    let _rules = parseConfig(config);
    let rules: Rules = {};
    for (let { path, module } of _rules) {
      let host: string;
      if (path.startsWith("/")) {
        host = fillHost;
        path = path;
      } else {
        host = path.split("/", 1)[0];
        path = path.slice(host.length);
      }
      let xrules = rules[host] || (rules[host] = []);
      xrules.push({
        regexp: globToRegExp(path, { globstar: true }),
        module: module,
      });
    }
    let newImportModules = _rules.map((r) => r.module);
    await this.mcache.preheat(newImportModules);
    if (currentCommitVersion < this.version) {
      // if has other higher commit version reload start, just exit
      return;
    }
    this.mcache.reset(newImportModules); // don't need wait, just clear old module cache
    this.rules = rules;
  };
  public init = async () => {
    await this.reload();
  };
  public findModule = (host: string, path: string) => {
    path = new URL(path, "http://x").pathname;
    let rules = this.rules[host] || this.rules[fillHost] || [];
    for (let rule of rules) {
      if (rule.regexp.test(path) == false) {
        continue;
      }
      return rule.module;
    }
    return "";
  };
  public async watchConfigFile() {
    const watcher = Deno.watchFs(this.config_path);
    for await (const event of watcher) {
      if (event.kind !== "modify") {
        continue;
      }
      this.reload().catch((e) => {
        console.error(e);
      });
    }
  }
}
