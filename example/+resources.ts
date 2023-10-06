// @ts-expect-error not supported yet
export default (): WorkerOptions["deno"] => {
  return {
    permissions: {},
  };
};
