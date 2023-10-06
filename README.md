### Introduction

serverless inspired by Svektekit router, based on deno and hono

### Use

```sh
deno run -A https://deno.land/x/uapi/start.ts ./example
```

example directory tree

```txt
example/
├── static
│   └── +index.ts
├── +resources.ts
├── +index.ts
└── foo
    ├── [rest]
    │   └── +index.ts
    ├── [...rest]
    │   └── +index.ts
    ├── +index.ts
    └── bar
        └── +index.ts
```

### Todo

- [ ] Resource Limit
- [ ] `/edit` webdav support
- [ ] `/debug` support
