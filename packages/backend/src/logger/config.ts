import type { LoggerOptions } from 'pino';
import { ENVIRONMENTS } from './constants';

interface LoggerConfig {
  development: LoggerOptions;
  staging: LoggerOptions;
  production: LoggerOptions;
  test: LoggerOptions;
}

const timestampFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'shortOffset',
  hour12: false,
});

function formatTimestamp() {
  return `,"timestamp":"${timestampFormatter.format(new Date()).replace(', ', ' ')}"`;
}

const baseConfig: Record<string, string> = {
  service: 'backend',
  env: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
};

const defaultConfig: LoggerConfig = {
  development: {
    level: 'debug',
    base: null,
    timestamp: formatTimestamp,
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
    timestamp: formatTimestamp,
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  production: {
    level: 'info',
    base: baseConfig,
    timestamp: formatTimestamp,
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  test: {
    level: 'silent',
  },
};

export default defaultConfig;
