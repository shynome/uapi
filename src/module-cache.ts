export class ModuleCache {
  private cache: { [k: string]: Promise<any> } = {};
  public import = (mod: string) => {
    this.cache[mod] = this.cache[mod] || import(mod);
    return this.cache[mod];
  };
  public preheat(modules: string[]) {
    return Promise.all(modules.map((m) => this.import(m)));
  }
  public reset = async (keepAliveModules: string[] = []) => {
    for (let m in this.cache) {
      if (keepAliveModules.includes(m)) {
        continue;
      }
      delete this.cache[m];
    }
  };
}
