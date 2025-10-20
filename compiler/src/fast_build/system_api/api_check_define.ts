/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

export const PERMISSION_TAG_CHECK_NAME: string = 'permission';
export const PERMISSION_TAG_CHECK_ERROR: string = "To use this API, you need to apply for the permissions: $DT";
export const SYSTEM_API_TAG_CHECK_NAME: string = 'systemapi';
export const SYSTEM_API_TAG_CHECK_WARNING: string = "'{0}' is system api";
export const TEST_TAG_CHECK_NAME: string = 'test';
export const TEST_TAG_CHECK_ERROR: string = "'{0}' can only be used for testing directories ";
export const SYSCAP_TAG_CHECK_NAME: string = 'syscap';
export const SYSCAP_TAG_CHECK_WARNING: string = "The system capacity of this api '{0}' is not supported on all devices";
export const SYSCAP_TAG_CONDITION_CHECK_WARNING: string = 'The API is not supported on all devices. Use the canIUse condition to determine whether the API is supported.';
export const CANIUSE_FUNCTION_NAME: string = 'canIUse';
export const VERSION_CHECK_FUNCTION_NAME: string = 'isApiVersionGreaterOrEqual';
export const RUNTIME_OS_OH: string = 'OpenHarmony';
export const FORM_TAG_CHECK_NAME: string = 'form';
export const FORM_TAG_CHECK_ERROR: string = "'{0}' can't support form application.";
export const CROSSPLATFORM_TAG_CHECK_NAME: string = 'crossplatform';
export const CROSSPLATFORM_TAG_CHECK_ERROR: string = "'{0}' can't support crossplatform application.";
export const DEPRECATED_TAG_CHECK_NAME: string = 'deprecated';
export const DEPRECATED_TAG_CHECK_WARNING: string = "'{0}' has been deprecated.";
export const FA_TAG_CHECK_NAME: string = 'famodelonly';
export const FA_TAG_HUMP_CHECK_NAME: string = 'FAModelOnly';
export const FA_TAG_CHECK_ERROR: string = 'This API is used only in FA Mode, but the current Mode is Stage.';
export const STAGE_TAG_CHECK_NAME: string = 'stagemodelonly';
export const STAGE_TAG_HUMP_CHECK_NAME: string = 'StageModelOnly';
export const STAGE_TAG_CHECK_ERROR: string = 'This API is used only in Stage Mode, but the current Mode is FA.';
export const STAGE_COMPILE_MODE: string = 'moduleJson';
export const ATOMICSERVICE_BUNDLE_TYPE: string = 'atomicService';
export const ATOMICSERVICE_TAG_CHECK_NAME: string = 'atomicservice';
export const ATOMICSERVICE_TAG_CHECK_ERROR: string = "'{0}' can't support atomicservice application.";
export const SINCE_TAG_NAME: string = 'since';
export const SINCE_TAG_CHECK_ERROR: string = "The '{0}' API is supported since SDK version $SINCE1. However, the current compatible SDK version is $SINCE2.";
export const ATOMICSERVICE_TAG_CHECK_VERSION: number = 11;
export const FIND_MODULE_WARNING: string = "Cannot find name '{0}'.";
export const AVAILABLE_TAG_NAME: string = 'available';
export const AVAILABLE_DECORATOR_WARNING: string =  "The '{0}' API is available since SDK version $SINCE1. However, the current compatible SDK version is $SINCE2.";
export const AVAILABLE_FILE_NAME: string = '@ohos.annotation.d.ets';

export const CONSTANT_STEP_0: number = 0;
export const CONSTANT_STEP_1: number = 1;
export const CONSTANT_STEP_2: number = 2;
export const CONSTANT_STEP_3: number = 3;

export const GLOBAL_DECLARE_WHITE_LIST: Set<string> = new Set(['Context', 'PointerStyle', 'PixelMap', 'UnifiedData',
  'Summary', 'UniformDataType', 'IntentionCode', 'NavDestinationInfo', 'UIContext', 'Resource', 'WebviewController']);

export enum ComparisonResult {
  Less = -1,
  Equal = 0,
  Greater = 1
}

export const SDK_SUBSYSTEM_CODE = "117";
export const ERROR_DESCRIPTION = "ArkTS Compiler Error";

interface MoreInfo {
  cn: string;
  en: string;
}

interface SdkHvigorLogInfo {
  code: string;
  description: string;
  cause: string;
  position: string;
  solutions: string[];
  moreInfo?: MoreInfo;
}

export class SdkHvigorErrorInfo implements SdkHvigorLogInfo {
  code: string = '';
  description: string = ERROR_DESCRIPTION;
  cause: string = '';
  position: string = '';
  solutions: string[] = [];

  getCode(): string {
    return this.code;
  }

  setCode(code: string): SdkHvigorErrorInfo {
    this.code = code;
    return this;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(description: string): SdkHvigorErrorInfo {
    this.description = description;
    return this;
  }

  getCause(): string {
    return this.cause;
  }

  setCause(cause: string): SdkHvigorErrorInfo {
    this.cause = cause;
    return this;
  }

  getPosition(): string {
    return this.position;
  }

  setPosition(position: string): SdkHvigorErrorInfo {
    this.position = position;
    return this;
  }

  getSolutions(): string[] {
    return this.solutions;
  }

  setSolutions(solutions: string[]): SdkHvigorErrorInfo {
    this.solutions = solutions;
    return this;
  }
}

interface BuildDiagnosticInterface {
  code: number;
  description: string;
  positionMessage: string;
  message: string;
  solutions: string[];
}

export class BuildDiagnosticInfo implements BuildDiagnosticInterface {
  code: number;
  description: string;
  positionMessage: string;
  message: string;
  solutions: string[];

  setCode(code: number): BuildDiagnosticInfo {
    this.code = code;
    return this;
  }

  getCode(): number {
    return this.code;
  }

  setDescription(description: string): BuildDiagnosticInfo {
    this.description = description;
    return this;
  }

  getDescription(): string {
    return this.description;
  }

  setPositionMessage(positionMessage: string): BuildDiagnosticInfo {
    this.positionMessage = positionMessage;
    return this;
  }

  getPositionMessage(): string {
    return this.positionMessage;
  }

  setMessage(message: string): BuildDiagnosticInfo {
    this.message = message;
    return this;
  }

  getMessage(): string {
    return this.message;
  }

  setSolutions(solutions: string[]): BuildDiagnosticInfo {
    this.solutions = solutions;
    return this;
  }

  getSolutions(): string[] {
    return this.solutions;
  }
}

export const ERROR_CODE_INFO: Map<string, Omit<SdkHvigorLogInfo, 'cause' | 'position'>> = new Map([
  [FORM_TAG_CHECK_ERROR, { code: '11706006', description: 'can\'t support form application.', solutions: ['Check the official API reference documentation,and switch to the supported interfaces.'] }],
  [CROSSPLATFORM_TAG_CHECK_ERROR, { code: '11706007', description: 'can\'t support crossplatform application.', solutions: ['Check the official API reference documentation,and switch to the supported interfaces.'] }],
  [FA_TAG_CHECK_ERROR, { code: '11706008', description: 'FA model interface used in Stage projects.', solutions: ['Check the official API reference documentation,and switch to the supported Stage model interfaces.'] }],
  [STAGE_TAG_CHECK_ERROR, { code: '11706009', description: 'Stage model interface used in FA projects.', solutions: ['Check the official API reference documentation,and switch to the supported FA model interfaces.'] }],
  [ATOMICSERVICE_TAG_CHECK_ERROR, { code: '11706010', description: 'can\'t support atomicservice application.', solutions: ['Check the official API reference documentation,and switch to the supported interfaces.'] }]
])

/**
 * Version validation result structure
 */
export interface VersionValidationResult {
  result: boolean;
  message: string;
}

/**
 * Value checker function type
 * @param sinceVersion - Required API version
 * @param targetVersion - Available/current version
 * @param triggerScene - Trigger scenario (0: warning, 1: suppress with open source target, 2: suppress with other target)
 */
export type ValueCheckerFunction = (
  sinceVersion: string,
  targetVersion: string,
  triggerScene: number
) => VersionValidationResult;

/**
 * Format checker function type
 * @param version - Version string to validate
 */
export type FormatCheckerFunction = (version: string) => boolean;

/**
 * Runtime OS constants
 */
export const RUNTIME_OS = {
  OPEN_HARMONY: 'OpenHarmony'
} as const;

/**
 * Comparison functions cache
 */
export const comparisonFunctions = {
  valueChecker: new Map<string, ValueCheckerFunction>(), 
  formatChecker: new Map<string, FormatCheckerFunction>()
};

export enum ComparisonSenario {
  Trigger = 0,
  SuppressWithoutMSF = 1,
  SuppressWithMSF = 2,
}
