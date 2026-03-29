import type { LoggerOptions } from 'pino';
import { ENVIRONMENTS } from './constants';

interface LoggerConfig {
  development: LoggerOptions;
  staging: LoggerOptions;
  production: LoggerOptions;
  test: LoggerOptions;
}

const baseConfig: Record<string, string> = {
  service: 'backend',
  env: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
};

const defaultConfig: LoggerConfig = {
  development: {
    level: 'debug',
    base: null,
    transport: {
      targets: [
        {
          target: 'pino-pretty',
          level: 'info',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'SYS:standard',
          },
        },
        {
          target: 'pino-loki',
          level: 'debug',
          options: {
            host: 'http://localhost:3100',
            silenceErrors: true,
            labels: baseConfig,
            propsToLabels: ['request_method', 'request_url'],
          },
        },
      ],
    },
  },
  staging: {
    level: 'info',
    base: baseConfig,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  },
  production: {
    level: 'info',
    base: baseConfig,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  },
  test: {
    level: 'silent',
  },
};

export default defaultConfig;
