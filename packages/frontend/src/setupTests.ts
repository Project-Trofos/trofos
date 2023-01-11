// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

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
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  antd.theme.defaultConfig.hashed = false;

  return antd;
});
