import { loadConfig, parseConfig, RouteItem } from "./config.ts";
import { globToRegExp } from "./deps.ts";
import { normalizePath, fillHost } from "./utils.ts";
import { ModuleCache } from "./module-cache.ts";

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
  constructor(
    private config_path: string,
    private mcache = new ModuleCache(),
  ) {}
  private version = 0;
  public rules: Rules = {};
  public reload = async (
    rules: RouteItem[],
    commitVersion = this.getCommitVersion(),
  ) => {
    // normalize module path
    rules = rules.map((r) => {
      r.module = normalizePath(r.module);
      return r;
    });

    let newRules: Rules = {};
    for (let { path, module } of rules) {
      let host: string;
      if (path.startsWith("/")) {
        host = fillHost;
        path = path;
      } else {
        host = path.split("/", 1)[0];
        path = path.slice(host.length);
      }
      let xrules = newRules[host] || (newRules[host] = []);
      xrules.push({
        regexp: globToRegExp(path, { globstar: true }),
        module: module,
      });
    }

    let newImportModules = rules.map((r) => r.module);
    await this.mcache.preheat(newImportModules);
    if (commitVersion < this.version) {
      // if has other higher commit version reload start, just exit
      return;
    }
    this.mcache.reset(newImportModules); // don't need wait, just clear old module cache

    this.rules = newRules;
  };
  public getCommitVersion = () => {
    const currentCommitVersion = this.version + 1;
    this.version = currentCommitVersion;
    return currentCommitVersion;
  };
  public reloadConfig = async () => {
    let config = await loadConfig(this.config_path);
    let rules = parseConfig(config);
    await this.reload(rules);
  };
  public init = async () => {
    await this.reloadConfig();
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
      this.reloadConfig().catch((e) => {
        console.error(e);
      });
    }
  }
}
