import { trpcMockCaller, trpcMockCallerWithoutAuth } from '@/__tests__/trpc-vitest-caller';
import { TRPCError } from '@trpc/server';

describe('v1.users', () => {
  test('should throw 401 when passing without valid token', async () => {
    let error: TRPCError | undefined;
    try {
      await trpcMockCallerWithoutAuth.v1.users.me();
    } catch (e: unknown) {
      error = e as TRPCError;
    }
    expect(error?.code).toBe('UNAUTHORIZED');
  });

  test('should throw 404 when token is valid but not onboarded', async () => {
    let error: TRPCError | undefined;
    try {
      await trpcMockCaller.v1.users.me();
    } catch (e: unknown) {
      error = e as TRPCError;
    }
    expect(error?.code).toBe('NOT_FOUND');
  });
});
