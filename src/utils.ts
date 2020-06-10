export const basedir = new URL(Deno.cwd() + "/", "file://").href;

export const normalizePath = (path: string) => new URL(path, basedir).href;

export const fillHost = "x";
