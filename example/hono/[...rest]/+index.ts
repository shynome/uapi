import { Hono } from "npm:hono";
import { z } from "npm:zod";
import { zValidator } from "npm:@hono/zod-validator";

const app = new Hono().basePath("/hono");

const schema = z.object({
  name: z.string(),
});

app.get("/hello/who", zValidator("query", schema), (c) => {
  const { name } = c.req.valid("query");
  return c.text(`hello ${name}`);
});

app.get("/hello", (c) => {
  return c.text("hello world");
});

export default app;
