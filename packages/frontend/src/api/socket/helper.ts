// Attach a function to a rtk hook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const attachFunctionToRtkHookHOF = <T extends (...args: any[]) => readonly any[]>(
  originalHook: T,
  fn: (...args: Parameters<ReturnType<T>[0]>) => void,
) => {
  const func = (...hookArgs: Parameters<T>): ReturnType<T> => {
    const [originalFunc, ...rest] = originalHook(...hookArgs);

    // Attach another function call after original invocation returned
    const mutateBacklog = (...mutArgs: Parameters<typeof originalFunc>): ReturnType<typeof originalFunc> => {
      const returnValue = originalFunc(...mutArgs);

      // Only emit event after return value is resolved
      // TODO(Luoyi): Is it possible to avoid this typecast?
      returnValue.then(() => fn(...(mutArgs as Parameters<ReturnType<T>[0]>)));

      return returnValue;
    };

    // TODO(Luoyi): Is it possible to avoid this typecast?
    return [mutateBacklog, ...rest] as ReturnType<T>;
  };

  return func;
};

export default attachFunctionToRtkHookHOF;
