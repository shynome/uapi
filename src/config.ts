import { RouteRule, RouteConfig } from './uapi.ts'
import { globToRegExp } from 'https://deno.land/std/path/glob.ts'

interface RouteItem {
  path: string
  module: string
}

export function normalizeConfig(config: RouteConfig, basepath: string = '') {
  let rules: RouteItem[] = []
  for (let k in config) {
    let val = config[k]
    if (typeof val === 'string') {
      let item = { path: basepath + k, module: val }
      rules.push(item)
    } else if (typeof val === 'object') {
      let currentBasepath = basepath + k
      let items = normalizeConfig(val, currentBasepath)
      rules = rules.concat(...items)
    } else {
      continue
    }
  }
  return rules
}

export function sortRules(rules: RouteItem[]) {
  let a = rules.filter((p) => p.path.startsWith('/') === false)
  let b = rules.filter((p) => p.path.startsWith('/'))
  rules = a.concat(b)
  return rules
}

export const parse = (config: RouteConfig): RouteRule[] => {
  let rules = normalizeConfig(config)
  rules = sortRules(rules)

  let routeRules = rules.map((rule) => {
    return {
      regexp: globToRegExp(rule.path, { globstar: true }),
      module: rule.module,
    }
  })

  return routeRules
}

export function preheatModules(rules: RouteRule[]) {
  return rules.map((rule) => import(rule.module))
}

export const loadConfig = () => {}
