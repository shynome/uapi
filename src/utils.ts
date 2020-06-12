export const basepath = new URL(Deno.cwd() + "/", "file://").href;

export const fillHost = "x";

export const makeGetFullpath = (baseurl: string) =>
  (path: string) => new URL(path, baseurl).href;

export const normalizePath = makeGetFullpath(basepath);
