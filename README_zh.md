### 缘起

有些时候需要写一些简单的 api 接口, 简单到可以部署到 serverless 平台上的那种

但没有一个 serverless 有很好的体验于是就写了这个, 可以自己部署的 typescript serverless function

serverless 的尽头就是 PHP, 所以我采用了和 PHP 一样的文件路由, 但略有不同

```ts
fetch("http://localhost:8000/foo/bar");
// 会依次尝试以下路径
[
  "/foo/bar/+index.ts",
  "/foo/bar/[rest]/+index.ts",
  "/foo/[rest]/+index.ts",
  "/foo/bar/[...rest]/+index.ts",
  "/foo/[...rest]/+index.ts",
  "/[...rest]/+index.ts",
];
```

ps: `+index.ts` 这种文件名是受 sveltekit 启发的

### 如何使用

创建 uapi 根文件夹 `./example`

```sh
deno run -A https://deno.land/x/uapi@v2.0.5/start.ts ./example
```

编辑 `./example/+index.ts`.

```ts
// ./example/+index.ts
export default {
  fetch: () => new Response("hello uapi"),
};
```

测试是否正常访问.

```sh
curl http://localhost:8000/
# logout: hello uapi
```

ps: 编辑 `./example/+index.ts` 保存后请求会得到最新的响应

### 其他

#### 为什么不使用 PHP

因为我一开始学编程的时候就被 PHP 气晕过去了

- 配置环境太难了.
- 需要包管理器, Deno 不需要
- 编辑器支持不如 typescript
