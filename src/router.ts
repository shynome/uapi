import { loadConfig, parseConfig } from "./config.ts";
import { globToRegExp } from "./deps.ts";
import { normalizePath, fillHost } from "./utils.ts";
import { preheatModules } from "./module-cache.ts";

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
  constructor(private config_path: string) {}
  private reloadLock = false;
  public rules: Rules = {};
  public reload = () => {
    if (this.reloadLock) {
      throw new Error(
        "The server is still reloading config, wait that finished",
      );
    }
    this.reloadLock = true;
    return Promise.resolve()
      .then(async () => {
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
        await Promise.all(preheatModules(_rules.map((r) => r.module)));
        this.rules = rules;
      })
      .finally(() => {
        this.reloadLock = false;
      });
  };
  public init = async () => {
    await this.reload();
  };
  public findModule = (host: string, path: string) => {
    path = new URL(path, "http://x").pathname;
    let rules = this.rules[host] || this.rules[fillHost];
    for (let rule of rules) {
      if (rule.regexp.test(path) == false) {
        continue;
      }
      return rule.module;
    }
    return "";
  };
}
