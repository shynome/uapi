import { ServerRequest } from "./deps.ts";
export default (req: ServerRequest) => {
  req.respond({
    status: 404,
    body: "no api rule match",
  });
};
