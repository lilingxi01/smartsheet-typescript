import { appRouter } from '@/server/routers/_app';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

const { req, res } = createMocks({
  headers: {
    authorization: 'test',
  },
});

export const trpcMockCaller = appRouter.createCaller({
  req: req as unknown as NextApiRequest,
  res: res as unknown as NextApiResponse,
});

const { req: reqWithoutAuth, res: resWithoutAuth } = createMocks();

export const trpcMockCallerWithoutAuth = appRouter.createCaller({
  req: reqWithoutAuth as unknown as NextApiRequest,
  res: resWithoutAuth as unknown as NextApiResponse,
});
