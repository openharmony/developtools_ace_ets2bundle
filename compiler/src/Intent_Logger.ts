import {getLogger} from 'log4js';

type ErrorCode = string;
type ErrorDescription = string;

/**
 * 日志工厂类（用于创建标准化的 LogData）
 */
export class LogDataFactory {
  static newInstance(
    code: ErrorCode,
    description: ErrorDescription,
    details: string
  ): LogData {
    return new LogData(code, description, details);
  }
}

/**
 * 日志数据实体类
 */
class LogData {
  code: string;
  description: string;
  cause: string;
  constructor(
    code: ErrorCode,
    description: string,
    cause: string = ''
  ) {
    this.code = code;
    this.description = description;
    this.cause = cause;
  }

  toString(): string {
    let errorString = `ERROR Code: ${this.code} ${this.description}\n`;

    if (this.cause) {
      errorString += `Error Message: ${this.cause}`;
      errorString += '\n\n';
    }

    return errorString;
  }
}

export class IntentLogger {
  private static instance: IntentLogger;
  private logger: Object = getLogger('ETS');
  static getInstance(): IntentLogger {
    if (!IntentLogger.instance) {
      IntentLogger.instance = new IntentLogger();
    }
    return IntentLogger.instance;
  }

  info(...args: string[]): void {
    this.logger.info(...args);
  }

  debug(...args: string[]): void {
    this.logger.debug(...args);
  }

  warn(...args: string[]): void {
    this.logger.warn(...args);
  }

  error(...args: string[]): void {
    this.logger.error(...args);
  }

  /**
   * 处理结构化错误数据（适配原始 printError 方法）
   * @param error LogData 实例或原始错误字符串
   */
  printError(error: LogData | string): void {
    if (typeof error === 'string') {
      this.logger.error(error);
    } else {
      this.logger.error(error.toString());
    }
  }

  /**
   * 处理致命错误（简化版直接抛出异常）
   * @param error LogData 实例或错误字符串
   */
  printErrorAndExit(error: LogData | string): never {
    const message = typeof error === 'string' ? error : error.toString();
    throw new Error(message);
  }
}
