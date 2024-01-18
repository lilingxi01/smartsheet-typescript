function standardizedErrorLog(msg: string) {
  console.error(msg);
}

export async function errorHandler<Response>(executor: () => Response | Promise<Response>): Promise<Response> {
  if (typeof executor !== 'function') {
    throw new Error('executor must be a function');
  }
  try {
    const result = executor();
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  } catch (e: unknown) {
    if (e instanceof Error) {
      standardizedErrorLog('# ERROR with Smartsheet SDK:');
      standardizedErrorLog('> ' + e.message);
      process.exit(1);
    } else {
      throw e;
    }
  }
}
