import { Db } from '@repo/data-ops/database';

export async function createContext({
  req,
  env,
  workerCtx,
  db,
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
  db: Db;
}) {
  return {
    req,
    env,
    db,
    workerCtx,
    userInfo: {
      userId: "1234567890",
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
