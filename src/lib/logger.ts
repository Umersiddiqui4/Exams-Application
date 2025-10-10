/**
 * Logger utility for consistent logging across the application
 * Provides different log levels and can be easily configured for production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig = {
    enabled: import.meta.env.DEV, // Only log in development by default
    level: 'debug',
    prefix: '[App]',
  };

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  /**
   * Configure the logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if a log level should be displayed
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  /**
   * Format log message with timestamp and prefix
   */
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = this.config.prefix || '';
    return `${timestamp} ${prefix} [${level.toUpperCase()}]`;
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), message, ...args);
    }
  }

  /**
   * Info level logging - general informational messages
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), message, ...args);
    }
  }

  /**
   * Warning level logging - warning messages
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), message, ...args);
    }
  }

  /**
   * Error level logging - error messages
   */
  error(message: string, error?: unknown, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), message, error, ...args);
    }
  }

  /**
   * Log API calls for debugging
   */
  api(method: string, url: string, data?: unknown): void {
    this.debug(`API ${method} ${url}`, data);
  }

  /**
   * Log component lifecycle events
   */
  component(componentName: string, event: string, data?: unknown): void {
    this.debug(`[${componentName}] ${event}`, data);
  }

  /**
   * Log form submissions
   */
  form(formName: string, action: string, data?: unknown): void {
    this.info(`Form ${formName}: ${action}`, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing or advanced usage
export { Logger };
export type { LogLevel, LoggerConfig };

