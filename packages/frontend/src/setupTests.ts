// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

// eslint-disable-next-line import/no-extraneous-dependencies
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { expect } from 'vitest';

expect.extend(matchers);
afterEach(() => {
  cleanup();
});
// https://github.com/ant-design/ant-design/issues/21096
Object.defineProperty(window, 'matchMedia', {
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }),
});

// https://github.com/ant-design/ant-design/blob/master/tests/setupAfterEnv.ts#L5-L26
// Disable antd V5 `css-dev-only-do-not-override` hashing
vi.mock('antd', async () => {
  const antd: any = await vi.importActual('antd');
  antd.theme.defaultConfig.hashed = false;

  return antd;
});

// Resolves error of ant design chart
// https://stackoverflow.com/questions/72186860/jest-react-testing-library-ant-design-chart-worker-error
class Worker {
  url: string;

  onmessage: (msg: any) => void;

  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg: any) {
    this.onmessage(msg);
  }
}
global.URL.createObjectURL = vi.fn();
window.Worker = Worker as unknown as typeof window.Worker;

// Resolve the issue where socket.io has a dependency using setImmediate
// https://github.com/prisma/prisma/issues/8558
// eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-explicit-any
global.setImmediate = global.setImmediate || ((fn: any, ...args: any) => global.setTimeout(fn, 0, ...args));
