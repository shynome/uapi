import { RouteConfig } from './router.ts'

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

export const parseConfig = (config: RouteConfig): RouteItem[] => {
  let rules = normalizeConfig(config)
  rules = sortRules(rules)
  return rules
}

let basedir = new URL(Deno.cwd() + '/', 'file://').href

export async function loadConfig(config_file: string = 'uapi.map.ts') {
  config_file = new URL(config_file, 'file://').pathname
  let { mtime } = await Deno.stat(config_file)
  config_file = config_file + `?mtime=${mtime?.getTime()}`
  let import_path = new URL(config_file, basedir).href
  let config = (await import(import_path)).default
  return config
}
