import { renderHook } from '@testing-library/react';
import attachFunctionToRtkHookHOF from './helper';

type ArgType = { projectId: number };

describe('test socket helper', () => {
  const OTHER_VAL1 = 'a';
  const OTHER_VAL2 = 'b';
  const getTestHook = () => {
    const hookFunc = jest.fn((args: ArgType) => Promise.resolve());
    const testHook = () => {
      return [hookFunc, OTHER_VAL1, OTHER_VAL2] as const;
    };
    return { testHook, hookFunc };
  };
  describe('attachFunctionToRtkHookHOF', () => {
    it('should call the attached function', async () => {
      const { testHook, hookFunc } = getTestHook();
      const functionToAttach = jest.fn();
      const newHook = attachFunctionToRtkHookHOF(testHook, functionToAttach);

      const { result } = renderHook(() => newHook());
      const [actualHookFunc] = result.current;

      const payload = { projectId: 1 };
      await actualHookFunc(payload);

      // Both the actual hook function and the attached function should be called.
      expect(hookFunc).toBeCalledTimes(1);
      expect(hookFunc).toBeCalledWith(payload);
      expect(functionToAttach).toBeCalledTimes(1);
      expect(functionToAttach).toBeCalledWith(payload);
    });

    it('should retain other hook return values', () => {
      const { testHook } = getTestHook();
      const functionToAttach = jest.fn();
      const newHook = attachFunctionToRtkHookHOF(testHook, functionToAttach);

      const { result } = renderHook(() => newHook());
      const [, other1, other2] = result.current;
      expect(other1).toStrictEqual(OTHER_VAL1);
      expect(other2).toStrictEqual(OTHER_VAL2);
    });
  });
});
