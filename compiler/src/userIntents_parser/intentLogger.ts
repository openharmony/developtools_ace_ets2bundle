/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {getLogger} from 'log4js';

type ErrorCode = string;
type ErrorDescription = string;

export class LogDataFactory {
  static newInstance(
    code: ErrorCode,
    description: ErrorDescription
  ): LogData {
    return new LogData(code, description);
  }
}

class LogData {
  code: string;
  description: string;

  constructor(
    code: ErrorCode,
    description: string
  ) {
    this.code = code;
    this.description = description;
  }

  toString(): string {
    return `ERROR Code: ${this.code} ${this.description}\n`;
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

  printError(error: LogData | string): void {
    if (typeof error === 'string') {
      this.logger.error(error);
    } else {
      this.logger.error(error.toString());
    }
  }

  printErrorAndExit(error: LogData | string): never {
    const message = typeof error === 'string' ? error : error.toString();
    throw new Error(message);
  }
}

export const ENTRYPATH_ERROR: LogData = LogDataFactory.newInstance('1001', '[InsightIntent] IntentDecorator needs to be in the .ets file');
export const DECORATOR_STATEMENT_ERROR: LogData = LogDataFactory.newInstance('1002', '[InsightIntent] decorator is not CallExpression');
export const DYNAMIC_PARAM_ERROR: LogData = LogDataFactory.newInstance('1003', '[InsightIntent] Dynamic variable cannot be resolved');
export const DISALLOWED_PARAM_ERROR: LogData = LogDataFactory.newInstance('1004', '[InsightIntent] param is disallowed');
export const UNSUPPORTED_PARSE_ERROR: LogData = LogDataFactory.newInstance('1005', '[InsightIntent] unsupported parameter type cannot be parsing');
export const INCORRECT_PARAM_TYPE_ERROR: LogData = LogDataFactory.newInstance('1006', '[InsightIntent] param parsing occurs error param type');
export const REQUIRED_PARAM_DISMISS_ERROR: LogData = LogDataFactory.newInstance('1007', '[InsightIntent] decorator args missing required param');
export const INTERNAL_ERROR: LogData = LogDataFactory.newInstance('1008', '[InsightIntent] internal error');
