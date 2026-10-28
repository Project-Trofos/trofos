import pino, { Logger, LoggerOptions, Bindings } from 'pino';
import defaultConfig from './config';
import { ENVIRONMENTS } from '../constants';
import { trace } from '@opentelemetry/api';

// mixins
const tracingMixin = () => {
  const activeSpan = trace.getActiveSpan();
  if (!activeSpan) return {};

  const spanContext = activeSpan.spanContext();
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    trace_flags: `0${spanContext.traceFlags.toString(16)}`,
  };
};

class LoggerProvider {
  private logger: Logger | null = null;

  initialize(options: LoggerOptions = {}): Logger {
    const env = (process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT) as keyof typeof defaultConfig;
    const baseConfig: LoggerOptions = defaultConfig[env];

    try {
      this.logger = pino({
        ...baseConfig,
        mixin: tracingMixin,
        ...options,
      });

      this.logger.info('Logger initialized successfully');
    } catch (error: unknown) {
      console.error('Error initializing logger:', error);

      this.logger = pino({
        level: 'info',
        timestamp: true,
      });
      this.logger.info('Logger initialized using fallback basic configuration');
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
