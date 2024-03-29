import { Hono } from "npm:hono";
import { UAPIRouter } from "./router.ts";
import path from "node:path";
import process from "node:process";

let rootdir = process.argv[2];

if (typeof rootdir !== "string") {
  throw new Error("must set uapi rootdir");
}

rootdir = path.join(process.cwd(), rootdir);
console.log("uapi rootdir:", rootdir);
const uapi = new UAPIRouter(rootdir);

const app = new Hono({
  router: uapi,
});
Deno.serve(app.fetch);
