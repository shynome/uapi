## Introduce

your serverless framework with typescript base on deno

## Use

### Configure

create a configure file `uapi.map.ts`

```ts
export default {
  "/api": "https://yourhost.com/api.ts",
  "/api-with-secret":
    "https://yourhost.com/api.ts?secret=xxxxx&you-can-find-secret-in-import.meta.url",
  "special.domain/api": "https://yourhost.com/api.ts",
  "special.domain": {
    "/": "https://yourhost.com/api.ts",
    "/subconfig": "https://yourhost.com/api.ts",
    "/*": "support globstar",
  },
  "/api/*": "write first, match first",
  "/api/hello": "never match",
  "/pwdapi": "./relative-pwd-ts-file",
};
```

Todo:
- [] reload config when updated config file

### Run

```sh
deno run -A https://deno.land/x/uapi/start.ts
```
