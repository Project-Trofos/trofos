import pino, { Logger, LoggerOptions, Bindings } from 'pino';
import defaultConfig from './config';
import { ENVIRONMENTS } from './constants';

class LoggerFactory {
  private static instance: LoggerFactory | null = null;
  private logger: Logger | null = null;

  constructor() {
    if (LoggerFactory.instance) {
      return LoggerFactory.instance;
    }
    LoggerFactory.instance = this;
  }

  initialize(options: LoggerOptions = {}): Logger {
    const env = (process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT) as keyof typeof defaultConfig;
    const baseConfig: LoggerOptions = defaultConfig[env];

    try {
      this.logger = pino({
        ...baseConfig,
        ...options,
      });

      // Log initialization success
      this.logger.info('Logger initialized successfully');
    } catch (error: unknown) {
      // Fallback to basic configuration if there's an error
      console.error('Error initializing logger:', error);
      this.logger = pino({
        level: 'info',
        timestamp: true,
      });
    }

    return this.logger!;
  }

  getLogger(): Logger {
    if (!this.logger) {
      this.initialize();
    }
    return this.logger!;
  }

  createChildLogger(bindings: Bindings): Logger {
    const logger = this.getLogger();
    return logger.child(bindings);
  }
}

const loggerFactory = new LoggerFactory();
export default loggerFactory;

export const getLogger = () => loggerFactory.getLogger();
export const createChildLogger = (bindings: Bindings) => loggerFactory.createChildLogger(bindings);
