// import { serve } from "https://deno.land/std@0.56.0/http/server.ts"";

/**api config */
export interface Config {}

export interface RouteConfig {
  [path: string]: string | RouteConfig
}

export interface Handler {
  (req: any): any
}

export interface Router {
  default: Handler
  config: Config
}

export interface RouteRule {
  regexp: RegExp
  module: string
}

export const findModule = (rules: RouteRule[]) => (path: string) => {
  for (let rule of rules) {
    if (rule.regexp.test(path) == false) {
      continue
    }
    return rule.module
  }
  return ''
}
