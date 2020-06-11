export class ModuleCache {
  private cache: { [k: string]: any } = {};
  public import = (mod: string) => {
    this.cache[mod] = this.cache[mod] || import(mod);
    return this.cache[mod];
  };
}

export const moduleCache = new ModuleCache();

export function preheatModules(rules: string[]) {
  return rules.map((m) => moduleCache.import(m));
}
