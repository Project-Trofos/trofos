import pino, { Logger, LoggerOptions, Bindings } from 'pino';
import defaultConfig from './config';
import { ENVIRONMENTS } from './constants';

class LoggerProvider {
  private static instance: LoggerProvider | null = null;
  private logger: Logger | null = null;

  constructor() {
    if (LoggerProvider.instance) {
      return LoggerProvider.instance;
    }
    LoggerProvider.instance = this;
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

const loggerProvider = new LoggerProvider();
export default loggerProvider;

export const getLogger = () => loggerProvider.getLogger();
export const createChildLogger = (bindings: Bindings) => loggerProvider.createChildLogger(bindings);
