import fs from "node:fs/promises";
import path from "node:path";

interface Handler {
  fetch(req: Request): Response | Promise<Response>;
}

export async function getHandler(fpath: string): Promise<Handler | null> {
  const mpath = await getHandlerFilepath(fpath);
  if (mpath === "") {
    return null;
  }
  const m = await import(mpath).then((d) => d.default);
  if (typeof m !== "object") {
    throw new Error("export default no");
  }
  const { fetch } = m;
  if (typeof fetch !== "function") {
    throw new Error("no fetch function");
  }
  return m;
}

export async function getHandlerFilepath(fpath: string): Promise<string> {
  const arr = getTryPaths(fpath);
  for (const p of arr) {
    for (const suffix of ["+index.js", "+index.ts"]) {
      const f = path.join(p, suffix);
      const stat = await fs.stat(f).catch((_err) => {
        return null;
      });
      if (stat !== null) {
        const mtime = stat.mtime.getTime();
        return `file://${f}?mtime=${mtime}`;
      }
    }
  }

  return "";
}

export function* getTryPaths(fpath: string) {
  yield fpath;
  const farr = fpath.split("/");
  for (let index = 0; index <= 1; index++) {
    const n = farr.length - index;
    const rest = path.join(farr.slice(0, n).join("/"), "[rest]");
    yield rest;
  }
  for (let index = farr.length; index > 1; index--) {
    const restAll = path.join(farr.slice(0, index).join("/"), "[...rest]");
    yield restAll;
  }
  return "";
}
