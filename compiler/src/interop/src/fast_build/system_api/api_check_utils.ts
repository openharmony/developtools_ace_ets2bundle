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

import ts from 'typescript';
import path from 'path';
import fs from 'fs';

import {
  projectConfig,
  extendSdkConfigs,
  globalProgram,
  ohosSystemModulePaths,
  systemModules,
  allModulesPaths,
  ohosSystemModuleSubDirPaths,
  externalApiCheckPlugin,
  externalApiMethodPlugin,
  fileAvailableCheckPlugin,
  externalApiCheckerMap
} from '../../../main';
import {
  LogType,
  LogInfo,
  IFileLog,
  CurrentProcessFile,
  findNonNullType
} from '../../utils';
import { type ResolveModuleInfo } from '../../ets_checker';
import {
  PERMISSION_TAG_CHECK_NAME,
  PERMISSION_TAG_CHECK_ERROR,
  SYSTEM_API_TAG_CHECK_NAME,
  SYSTEM_API_TAG_CHECK_WARNING,
  TEST_TAG_CHECK_NAME,
  TEST_TAG_CHECK_ERROR,
  SYSCAP_TAG_CHECK_NAME,
  SYSCAP_TAG_CONDITION_CHECK_WARNING,
  SYSCAP_TAG_CHECK_WARNING,
  CANIUSE_FUNCTION_NAME,
  FORM_TAG_CHECK_NAME,
  FORM_TAG_CHECK_ERROR,
  FIND_MODULE_WARNING,
  CROSSPLATFORM_TAG_CHECK_NAME,
  CROSSPLATFORM_TAG_CHECK_ERROR,
  DEPRECATED_TAG_CHECK_NAME,
  DEPRECATED_TAG_CHECK_WARNING,
  FA_TAG_CHECK_NAME,
  FA_TAG_HUMP_CHECK_NAME,
  FA_TAG_CHECK_ERROR,
  STAGE_TAG_CHECK_NAME,
  STAGE_TAG_HUMP_CHECK_NAME,
  STAGE_TAG_CHECK_ERROR,
  STAGE_COMPILE_MODE,
  ATOMICSERVICE_BUNDLE_TYPE,
  ATOMICSERVICE_TAG_CHECK_NAME,
  ATOMICSERVICE_TAG_CHECK_ERROR,
  ATOMICSERVICE_TAG_CHECK_VERSION,
  RUNTIME_OS_OH,
  CONSTANT_STEP_0,
  CONSTANT_STEP_1,
  CONSTANT_STEP_2,
  CONSTANT_STEP_3,
  GLOBAL_DECLARE_WHITE_LIST,
  SINCE_TAG_NAME,
  SINCE_TAG_CHECK_ERROR,
  VERSION_CHECK_FUNCTION_NAME,
  ComparisonResult,
  BuildDiagnosticInfo,
  ERROR_CODE_INFO,
  SdkHvigorErrorInfo,
  SdkHvigorLogInfo,
  AVAILABLE_DECORATOR_WARNING,
  VersionValidationResult,
  ValueCheckerFunction,
  FormatCheckerFunction,
  comparisonFunctions,
  AVAILABLE_FILE_NAME,
  ParsedVersion,
  AVAILABLE_VERSION_FORMAT_ERROR_PREFIX,
  AVAILABLE_VERSION_FORMAT_ERROR,
  AVAILABLE_OSNAME_ERROR,
  ComparisonSenario,
  AVAILABLE_TAG_NAME,
  AVAILABLE_SCOPE_ERROR,
  DeviceDiffType,
  SINCE_LEVEL_CONFIG,
  APIAVAILABLE_CHECK_ERROR,
  APIAVAILABLE_OPENHARMONY_CHECK_ERROR,
  DistributionOSApiAvailableVersionResult,
  MSF_INTEGER_VERSION,
  ApiAvailableResult
} from './api_check_define';
import { JsDocCheckService } from './api_check_permission';
import { SinceJSDocChecker } from './api_checker/since_version_checker';
import { AvailableAnnotationChecker } from './api_checker/available_version_checker';
import { SinceWarningSuppressor } from './api_validator/since_warning_suppressor';
import { AvailableWarningSuppressor } from './api_validator/available_warning_suppressor';
import { SyscapWarningSuppressor } from './api_validator/syscap_warning_suppressor';
import { PermissionWarningSuppressor } from './api_validator/permission_warning_suppressor';
import { SDK_CONSTANTS } from './api_validator/api_validate_node';

/**
 * bundle info
 *
 * @interface BundleInfo
 */
interface BundleInfo {
  bundlePath: string;
  bundleVersion: string;
}

/**
* Verify logical interface.
* 
* @interface JsDocNodeCheckConfigItemInterface
*/
interface JsDocNodeCheckConfigItemInterface {
  /**
  * check node
  * @type { string[] } 
  */
  tagName: string[],
  /**
  * check message
  * @type { string }
  */
  message: string,
  /**
  * check type wanr/error
  * @type { ts.DiagnosticCategory }
  */
  type: ts.DiagnosticCategory,
  /**
  * check node should exist
  * @type { boolean }
  */
  tagNameShouldExisted: boolean,
  /**
  * check suppress call back
  * @type {CheckJsDocSpecialValidCallbackInterface}
  */
  checkJsDocSuppressorValidCallback?: CheckJsDocSpecialValidCallbackInterface
}

export interface CheckJsDocSpecialValidCallbackInterface {
  (jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem, node?: ts.Node,
    declaration?: ts.Declaration): boolean;
}

interface HasJSDocNode extends ts.Node {
  jsDoc?: ts.JSDoc[];
}

/**
 * get the bundleInfo of ohm
 *
 * @param {string} modulePath
 * @return {BundleInfo}
 */
function parseOhmBundle(modulePath: string): BundleInfo {
  const apiCode: string = fs.readFileSync(modulePath, { encoding: 'utf-8' });
  const bundleTags: string[] = apiCode.match(/@bundle.+/g);
  const bundleInfo: BundleInfo = {
    bundlePath: '',
    bundleVersion: ''
  };
  if (bundleTags && bundleTags.length > CONSTANT_STEP_0) {
    const bundleTag: string = bundleTags[CONSTANT_STEP_0];
    const bundleInfos: string[] = bundleTag.split(' ');
    if (bundleInfos.length === CONSTANT_STEP_3) {
      bundleInfo.bundlePath = bundleInfos[CONSTANT_STEP_1];
      bundleInfo.bundleVersion = bundleInfos[CONSTANT_STEP_2];
    }
  }
  return bundleInfo;
}

/**
 * jude a version string , string has two format
 *   xx:is a number and need greater than 10
 *   x.x.x: a string join '.', the first part and second part is number and need greater than 4.1
 *
 * @param {string} bundleVersion - version string
 * @returns {boolean}
 */
function checkBundleVersion(bundleVersion: string): boolean {
  if (!projectConfig.compatibleSdkVersion) {
    return true;
  }
  const compatibleSdkVersion: string = projectConfig.compatibleSdkVersion;
  let bundleVersionNumber: number = 0;
  const bundleVersionArr = bundleVersion.match(/(?<=\().*(?=\))/g);
  if (bundleVersionArr && bundleVersionArr.length === 1) {
    bundleVersionNumber = Number(bundleVersionArr[CONSTANT_STEP_0]);
  } else {
    bundleVersionNumber = Number(bundleVersion);
  }
  if (bundleVersion && bundleVersion !== '' && !isNaN(bundleVersionNumber) &&
    !isNaN(Number(compatibleSdkVersion)) && Number(compatibleSdkVersion) >= bundleVersionNumber) {
    return true;
  }
  return false;
}

/**
 * get the real path about a list in module path
 *
 * @param {string[]} apiDirs - file list
 * @param {string} moduleName - module dir
 * @param {string[]} exts - ext
 * @returns  {ResolveModuleInfo}
 */
export function getRealModulePath(apiDirs: string[], moduleName: string, exts: string[]): ResolveModuleInfo {
  const resolveResult: ResolveModuleInfo = {
    modulePath: '',
    isEts: true
  };
  for (let i = 0; i < apiDirs.length; i++) {
    const dir = apiDirs[i];
    for (let i = 0; i < exts.length; i++) {
      const ext = exts[i];
      const moduleDir = path.resolve(dir, moduleName + ext);
      if (!fs.existsSync(moduleDir)) {
        continue;
      }
      resolveResult.modulePath = moduleDir;
      if (ext === '.d.ts') {
        resolveResult.isEts = false;
      }
      break;
    }
  }
  return resolveResult;
}

/**
 * get a request path about ohos
 *
 * @param {string} moduleRequest - import request path
 * @param {string} _ - import request path
 * @param {number} moduleType
 * @param {string} systemKey
 * @returns {string}
 */
export function moduleRequestCallback(moduleRequest: string, _: string,
  moduleType: string, systemKey: string): string {
  for (const config of extendSdkConfigs.values()) {
    if (config.prefix === '@arkui-x') {
      continue;
    }
    if (moduleRequest.startsWith(config.prefix + '.')) {
      let compileRequest: string = `${config.prefix}:${systemKey}`;
      const resolveModuleInfo: ResolveModuleInfo = getRealModulePath(config.apiPath, moduleRequest,
        ['.d.ts', '.d.ets']);
      const modulePath: string = resolveModuleInfo.modulePath;
      if (!fs.existsSync(modulePath)) {
        return compileRequest;
      }
      const bundleInfo: BundleInfo = parseOhmBundle(modulePath);
      if (checkBundleVersion(bundleInfo.bundleVersion)) {
        compileRequest = `@bundle:${bundleInfo.bundlePath}`;
      }
      return compileRequest;
    }
  }
  return '';
}

/**
 * check arkui dependences in ts files
 * api check from sdk
 *
 * @param {ts.TypeReferenceNode} node - typeReferenceNode
 * @param {IFileLog} transformLog - log info
 */
export function checkTypeReference(node: ts.TypeReferenceNode, transformLog: IFileLog): void {
  const fileName: string = transformLog.sourceFile.fileName;
  const currentTypeName: string = node.getText();
  if (/(?<!\.d)\.ts$/g.test(fileName)) {
    const checker: ts.TypeChecker | undefined = CurrentProcessFile.getChecker();
    if (!checker) {
      return;
    }
    const type: ts.Type = checker.getTypeAtLocation(node);
    let sourceFile: ts.SourceFile | undefined;
    if (type && type.aliasSymbol && type.aliasSymbol.declarations && type.aliasSymbol.declarations.length > 0) {
      sourceFile = ts.getSourceFileOfNode(type.aliasSymbol.declarations[0]);
    } else if (type && type.symbol && type.symbol.declarations && type.symbol.declarations.length > 0) {
      sourceFile = ts.getSourceFileOfNode(type.symbol.declarations[0]);
    }
    if (!sourceFile) {
      return;
    }
    const sourceBaseName: string = path.basename(sourceFile.fileName);
    if (isArkuiDependence(sourceFile.fileName) &&
      sourceBaseName !== 'common_ts_ets_api.d.ts' &&
      sourceBaseName !== 'global.d.ts'
    ) {
      // TODO: change to error
      transformLog.errors.push({
        type: LogType.WARN,
        message: `Cannot find name '${currentTypeName}'.`,
        pos: node.getStart()
      });
    } else if (GLOBAL_DECLARE_WHITE_LIST.has(currentTypeName) &&
      ohosSystemModulePaths.includes(sourceFile.fileName.replace(/\//g, '\\'))) {
      transformLog.errors.push({
        type: LogType.WARN,
        message: `Cannot find name '${currentTypeName}'.`,
        pos: node.getStart()
      });
    }
  }
}

/**
 * get jsDocNodeCheckConfigItem object
 *
 * The demandConditionCheck and specialCheckConditionFuncName in the return value are fixed values
 * to avoid modifying the logic in the tsc warehouse and causing problems.
 * 
 * @param {JsDocNodeCheckConfigItemInterface} config - param All
 * @returns  {ts.JsDocNodeCheckConfigItem}
 */
function getJsDocNodeCheckConfigItem(
  config: JsDocNodeCheckConfigItemInterface
): ts.JsDocNodeCheckConfigItem {
  return {
    tagName: config.tagName,
    message: config.message,
    needConditionCheck: false,
    type: config.type,
    specifyCheckConditionFuncName: '',
    tagNameShouldExisted: config.tagNameShouldExisted,
    checkJsDocSuppressorValidCallback: config.checkJsDocSuppressorValidCallback
  };
}

/**
 * judge a file is card file
 *
 * @param {string} file - file path
 * @returns {boolean}
 */
export function isCardFile(file: string): boolean {
  for (const key in projectConfig.cardEntryObj) {
    if (path.normalize(projectConfig.cardEntryObj[key]) === path.normalize(file)) {
      return true;
    }
  }
  return false;
}

const jsDocNodeCheckConfigCache: Map<string, Map<string, ts.JsDocNodeCheckConfig>> = new Map<string, Map<string, ts.JsDocNodeCheckConfig>>();
const availableNodeCheckConfigCache: Map<string, string> = new Map<string, string>();
let permissionsArray: string[] = [];

/**
 * get find find module check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getFindModuleCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const cannotFindNameConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [],
    message: FIND_MODULE_WARNING,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: true
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(cannotFindNameConfig));
}

/**
 * get available check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getAvailableCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const diagnosticType: ts.DiagnosticCategory = getSinceDiagnosticType(projectConfig.strictMode?.apiCompatibilityCheck);
  const availableConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [SINCE_TAG_NAME],
    message: SINCE_TAG_CHECK_ERROR,
    type: diagnosticType,
    tagNameShouldExisted: true,
    checkJsDocSuppressorValidCallback: checkAvailableDecorator
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(availableConfig));
}

/**
 * get deprecated check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getDeprecatedCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const deprecatedConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [DEPRECATED_TAG_CHECK_NAME],
    message: DEPRECATED_TAG_CHECK_WARNING,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: false
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(deprecatedConfig));
}

/**
 * get system api check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getSystemApiCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const systemApiConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [SYSTEM_API_TAG_CHECK_NAME],
    message: SYSTEM_API_TAG_CHECK_WARNING,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: false
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(systemApiConfig));
}

/**
 * get since check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getSinceCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const diagnosticType: ts.DiagnosticCategory = getSinceDiagnosticType(projectConfig.strictMode?.apiCompatibilityCheck);
  const sinceConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [SINCE_TAG_NAME],
    message: SINCE_TAG_CHECK_ERROR,
    type: diagnosticType,
    tagNameShouldExisted: false,
    checkJsDocSuppressorValidCallback: checkSinceValue
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(sinceConfig));
}

/**
 * get syscap check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getSyscapCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const syscapConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [SYSCAP_TAG_CHECK_NAME],
    message: SYSCAP_TAG_CHECK_WARNING,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: false,
    checkJsDocSuppressorValidCallback: checkSyscapAbility
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(syscapConfig));
}

/**
 * get test check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getTestCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const testConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [TEST_TAG_CHECK_NAME],
    message: TEST_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: false
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(testConfig));
}

/**
 * get permission check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getPermissionCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const permissionConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [PERMISSION_TAG_CHECK_NAME],
    message: PERMISSION_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Warning,
    tagNameShouldExisted: false,
    checkJsDocSuppressorValidCallback: checkPermissionValue
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(permissionConfig));
}

/**
 * get form check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getFormCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const formConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [FORM_TAG_CHECK_NAME],
    message: FORM_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error,
    tagNameShouldExisted: true
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(formConfig));
}

/**
 * get crossplatform check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @param {ts.DiagnosticCategory} logType - diagnostic category
 * @returns {void}
 */
function getCrossplatformCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[], logType: ts.DiagnosticCategory): void {
  const crossplatformConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [CROSSPLATFORM_TAG_CHECK_NAME],
    message: CROSSPLATFORM_TAG_CHECK_ERROR,
    type: logType,
    tagNameShouldExisted: true
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(crossplatformConfig));
}

/**
 * get FA module check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getFAModuleCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const faModelOnlyConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [FA_TAG_CHECK_NAME, FA_TAG_HUMP_CHECK_NAME],
    message: FA_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error,
    tagNameShouldExisted: false
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(faModelOnlyConfig));
}

/**
 * get stage module check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getStageModuleCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const stageModelOnlyConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [STAGE_TAG_CHECK_NAME, STAGE_TAG_HUMP_CHECK_NAME],
    message: STAGE_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error,
    tagNameShouldExisted: false
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(stageModelOnlyConfig));
}

/**
 * get atomicservice check config
 *
 * @param {ts.JsDocNodeCheckConfigItem[]} checkConfigArray - check config array
 * @returns {void}
 */
function getAtomicserviceCheckConfig(checkConfigArray: ts.JsDocNodeCheckConfigItem[]): void {
  const atomicserviceConfig: JsDocNodeCheckConfigItemInterface = {
    tagName: [ATOMICSERVICE_TAG_CHECK_NAME],
    message: ATOMICSERVICE_TAG_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error,
    tagNameShouldExisted: true
  }
  checkConfigArray.push(getJsDocNodeCheckConfigItem(atomicserviceConfig));
}

/**
 * get tagName where need to be determined based on the file path
 *
 * @param {string} fileName - file name
 * @param {string} sourceFileName - resource reference path
 * @returns {ts.JsDocNodeCheckConfig}
 */
export function getJsDocNodeCheckConfig(fileName: string, sourceFileName: string): ts.JsDocNodeCheckConfig {
  let byFileName: Map<string, ts.JsDocNodeCheckConfig> | undefined = jsDocNodeCheckConfigCache.get(fileName);
  if (byFileName === undefined) {
    byFileName = new Map<string, ts.JsDocNodeCheckConfig>();
    jsDocNodeCheckConfigCache.set(fileName, byFileName);
  }
  let result: ts.JsDocNodeCheckConfig | undefined = byFileName.get(sourceFileName);
  if (result !== undefined) {
    return result;
  }
  let needCheckResult: boolean = false;
  const checkConfigArray: ts.JsDocNodeCheckConfigItem[] = [];
  const apiName: string = path.basename(fileName);
  const sourceBaseName: string = path.basename(sourceFileName);
  result = {
    nodeNeedCheck: needCheckResult,
    checkConfig: checkConfigArray
  };
  initComparisonFunctions();
  if (/(?<!\.d)\.ts$/g.test(fileName) && isArkuiDependence(sourceFileName) &&
    sourceBaseName !== 'common_ts_ets_api.d.ts' && sourceBaseName !== 'global.d.ts') {
    getFindModuleCheckConfig(checkConfigArray);
  }
  if (systemModules.includes(apiName)) {
    byFileName.set(sourceFileName, result);
    return result;
  }
  if (checkFileHasAvailableByFileName(sourceFileName)) {
    needCheckResult = true;
    getAvailableCheckConfig(checkConfigArray);
  } else if (allModulesPaths.includes(path.normalize(sourceFileName)) || isArkuiDependence(sourceFileName)) {
    permissionsArray = projectConfig.requestPermissions;
    getDeprecatedCheckConfig(checkConfigArray);
    getSystemApiCheckConfig(checkConfigArray);
    if (sourceBaseName !== AVAILABLE_FILE_NAME) {
      getSinceCheckConfig(checkConfigArray);
    }
    // TODO: the third param is to be opened
    if (projectConfig.deviceTypes && projectConfig.deviceTypes.length > 0) {
      getSyscapCheckConfig(checkConfigArray);
    }
    if (projectConfig.projectRootPath && projectConfig.modulePath) {
      const ohosTestDir = ts.sys.resolvePath(path.join(projectConfig.modulePath, 'src', 'ohosTest'));
      // TODO:fix error type in the feature
      if (!ts.sys.resolvePath(fileName).startsWith(ohosTestDir)) {
        permissionsArray = projectConfig.requestPermissions;
        getTestCheckConfig(checkConfigArray);
      }
    }
    getPermissionCheckConfig(checkConfigArray);
    if (isCardFile(fileName)) {
      needCheckResult = true;
      getFormCheckConfig(checkConfigArray);
    }
    if (projectConfig.isCrossplatform) {
      needCheckResult = true;
      const logType: ts.DiagnosticCategory = projectConfig.ignoreCrossplatformCheck !== true ? ts.DiagnosticCategory.Error :
        ts.DiagnosticCategory.Warning;
      getCrossplatformCheckConfig(checkConfigArray, logType);
    }
    if (process.env.compileMode === STAGE_COMPILE_MODE) {
      needCheckResult = true;
      getFAModuleCheckConfig(checkConfigArray);
    } else if (process.env.compileMode !== '') {
      needCheckResult = true;
      getStageModuleCheckConfig(checkConfigArray);
    }
    if (projectConfig.bundleType === ATOMICSERVICE_BUNDLE_TYPE &&
      projectConfig.compileSdkVersion >= ATOMICSERVICE_TAG_CHECK_VERSION) {
      needCheckResult = true;
      getAtomicserviceCheckConfig(checkConfigArray);
    }
  }
  result = {
    nodeNeedCheck: needCheckResult,
    checkConfig: checkConfigArray
  };
  byFileName.set(sourceFileName, result);
  return result;
}

const arkuiDependenceMap: Map<string, boolean> = new Map<string, boolean>();
/**
 * return a file path is Arkui path
 *
 * @param {string} file - file path
 * @returns {boolean}
 */
function isArkuiDependence(file: string): boolean {
  let exists: boolean | undefined = arkuiDependenceMap.get(file);
  if (exists !== undefined) {
    return exists;
  }
  const fileDir: string = path.dirname(file);
  const declarationsPath: string = path.resolve(__dirname, '../../../declarations').replace(/\\/g, '/');
  const componentPath: string = path.resolve(__dirname, '../../../../../component').replace(/\\/g, '/');
  exists = fileDir === declarationsPath || fileDir === componentPath;
  arkuiDependenceMap.set(file, exists);
  return exists;
}

/**
 * check a secondary directory of Arkui is used in the moduleSpecifier of import
 *
 * @param {ts.Expression} moduleSpecifier - the moduleSpecifier of import
 * @param {LogInfo[]} log - log list
 */
export function validateModuleSpecifier(moduleSpecifier: ts.Expression, log: LogInfo[]): void {
  const moduleSpecifierStr: string = moduleSpecifier.getText().replace(/'|"/g, '');
  const hasSubDirPath: boolean = ohosSystemModuleSubDirPaths.some((filePath: string) => {
    return filePath === moduleSpecifierStr;
  });
  if (hasSubDirPath) {
    // TODO: change to error
    const error: LogInfo = {
      type: LogType.WARN,
      message: `Cannot find module '${moduleSpecifierStr}' or its corresponding type declarations.`,
      pos: moduleSpecifier.getStart()
    };
    log.push(error);
  }
}

interface SystemConfig {
  deviceTypesMessage: string,
  deviceTypes: string[],
  runtimeOS: string,
  externalApiPaths: string[],
  syscapIntersectionSet: Set<string>,
  syscapUnionSet: Set<string>
}

interface SyscapConfig {
  SysCaps: string[]
}

/**
 * configure syscapInfo to this.share.projectConfig
 *
 * @param config this.share.projectConfig
 */
export function configureSyscapInfo(config: SystemConfig): void {
  config.deviceTypesMessage = config.deviceTypes.join(',');
  const deviceDir: string = path.resolve(__dirname, '../../../../../api/device-define/');
  const deviceInfoMap: Map<string, string[]> = new Map();
  const syscaps: Array<string[]> = [];
  let allSyscaps: string[] = [];
  config.deviceTypes.forEach((deviceType: string) => {
    collectOhSyscapInfos(deviceType, deviceDir, deviceInfoMap);
  });
  if (config.runtimeOS !== RUNTIME_OS_OH) {
    collectExternalSyscapInfos(config.externalApiPaths, config.deviceTypes, deviceInfoMap);
  }
  deviceInfoMap.forEach((value: string[]) => {
    syscaps.push(value);
    allSyscaps = allSyscaps.concat(value);
  });
  const intersectNoRepeatTwice = (arrs: Array<string[]>) => {
    return arrs.reduce(function (prev: string[], cur: string[]) {
      return Array.from(new Set(cur.filter((item: string) => {
        return prev.includes(item);
      })));
    });
  };
  let syscapIntersection: string[] = [];
  if (config.deviceTypes.length === 1 || syscaps.length === 1) {
    syscapIntersection = syscaps[0];
  } else if (syscaps.length > 1) {
    syscapIntersection = intersectNoRepeatTwice(syscaps);
  }
  config.syscapIntersectionSet = new Set(syscapIntersection);
  config.syscapUnionSet = new Set(allSyscaps);
}

function collectOhSyscapInfos(deviceType: string, deviceDir: string, deviceInfoMap: Map<string, string[]>) {
  let syscapFilePath: string = '';
  if (deviceType === 'phone') {
    syscapFilePath = path.resolve(deviceDir, 'default.json');
  } else {
    syscapFilePath = path.resolve(deviceDir, deviceType + '.json');
  }
  if (fs.existsSync(syscapFilePath)) {
    const content: SyscapConfig = JSON.parse(fs.readFileSync(syscapFilePath, 'utf-8'));
    if (deviceInfoMap.get(deviceType)) {
      deviceInfoMap.set(deviceType, deviceInfoMap.get(deviceType).concat(content.SysCaps));
    } else {
      deviceInfoMap.set(deviceType, content.SysCaps);
    }
  }
}

function collectExternalSyscapInfos(
  externalApiPaths: string[],
  deviceTypes: string[],
  deviceInfoMap: Map<string, string[]>
) {
  const externalDeviceDirs: string[] = [];
  externalApiPaths.forEach((externalApiPath: string) => {
    const externalDeviceDir: string = path.resolve(externalApiPath, './api/device-define');
    if (fs.existsSync(externalDeviceDir)) {
      externalDeviceDirs.push(externalDeviceDir);
    }
  });
  externalDeviceDirs.forEach((externalDeviceDir: string) => {
    deviceTypes.forEach((deviceType: string) => {
      let syscapFilePath: string = '';
      const files: string[] = fs.readdirSync(externalDeviceDir);
      files.forEach((fileName: string) => {
        if (fileName.startsWith(deviceType)) {
          syscapFilePath = path.resolve(externalDeviceDir, fileName);
          if (fs.existsSync(syscapFilePath)) {
            const content: SyscapConfig = JSON.parse(fs.readFileSync(syscapFilePath, 'utf-8'));
            if (deviceInfoMap.get(deviceType)) {
              deviceInfoMap.set(deviceType, deviceInfoMap.get(deviceType).concat(content.SysCaps));
            } else {
              deviceInfoMap.set(deviceType, content.SysCaps);
            }
          }
        }
      });
    });
  });
}

/**
 * Duplicate node checks have been identified. A temporary solution employs local filtering.
 * @param node check node
 * @returns nodeKey for filter
 */
function getAvailableNodeKey(node: ts.Node): string {
  const sourceFile: ts.SourceFile = node.getSourceFile();
  const fileName: string = path.basename(sourceFile.fileName);
  return `${fileName}::${node.pos}::${node.end}`;
}

/**
 * Checks the @Available decorator and validates compatibility with the current API version.
 * 
 * Processing Steps (inside checkAvailable):
 * 1. Extract the @Available decorator from the node
 * 2. Parse the target version from the decorator
 * 3. Parse the project API version
 * 4. Compare operating system identifiers
 * 5. Compare version numbers
 * 6. If incompatibility is found, return true
 * 
 * @param jsDocTags - JSDoc tags (not used currently, but may be useful in the future)
 * @param config - Config object used for warning/error messages
 * @param node - The TypeScript node to check
 * @returns True if incompatibility is detected, otherwise false
 */
function checkAvailableDecorator(
  jsDocTags: readonly ts.JSDocTag[],
  config: ts.JsDocNodeCheckConfigItem,
  node?: ts.Node,
  declaration?: ts.Declaration
): boolean {
  // If there is no node, we cannot perform any check
  if (!projectConfig.compatibleSdkVersion || !node || !declaration) {
    return false;
  }

  let key: string = getAvailableNodeKey(node);
  if (availableNodeCheckConfigCache.has(key)) {
    return false;
  } else {
    availableNodeCheckConfigCache.set(key, '');
  }
  const sourcefile = node.getSourceFile();
  if (!sourcefile || !sourcefile.fileName || !path.normalize(sourcefile.fileName).startsWith(projectConfig.projectRootPath)) {
    return false;
  }

  const declSourcefile = declaration.getSourceFile();
  if (!declSourcefile || !declSourcefile.fileName || !path.normalize(declSourcefile.fileName).startsWith(projectConfig.projectRootPath)) {
    return false;
  }
  const typeChecker = CurrentProcessFile.getChecker();

  const checker = new AvailableAnnotationChecker(typeChecker);
  const hasIncompatibility = checker.checkTargetVersion(declaration);

  if (!hasIncompatibility) {
    return false;
  }

  const minApiVersion = checker.getMinApiVersion();  // Minimum required API version

  const suppressor = new AvailableWarningSuppressor(
    checker.getSdkVersion(),
    minApiVersion,
    checker.getAvailableVersion(),
    typeChecker,
    declaration
  );

  if (suppressor.isApiVersionHandled(node)) {
    return false;
  }

  config.message = AVAILABLE_DECORATOR_WARNING
    .replace('$SINCE1', checker.getAvailableVersion()?.version || checker.getSdkVersion())  // Minimum required API version
    .replace('$SINCE2', checker.getSdkVersion());     // Current project API version

  return true;
}


/**
 * Validates if a since tag requires version checking based on JSDoc and project configuration.
 * 
 * @param jsDocTags - Array of JSDoc tags to analyze
 * @param config - Configuration object that will receive error messages
 * @param node - Optional TypeScript node for additional validation
 * @param declaration - Optional TypeScript declaration for additional validation
 * @returns True if since check is required and validation fails, false otherwise
 */
function checkSinceValue(
  jsDocTags: readonly ts.JSDocTag[],
  config: ts.JsDocNodeCheckConfigItem,
  node?: ts.Node,
  declaration?: ts.Declaration
): boolean {
  if (!jsDocTags[0]?.parent?.parent || !projectConfig.compatibleSdkVersion || !node || !declaration) {
    return false;
  }

  const jsDocNode = jsDocTags[0].parent.parent as HasJSDocNode;
  if (!jsDocNode?.jsDoc) {
    return false;
  }
  const sourcefile = node.getSourceFile();
  if (!sourcefile || !sourcefile.fileName || !path.normalize(sourcefile.fileName).startsWith(projectConfig.projectRootPath)) {
    return false;
  }
  const typeChecker = CurrentProcessFile.getChecker();

  const checker = new SinceJSDocChecker(typeChecker);
  const hasIncompatibility = checker.checkTargetVersion(jsDocNode);

  if (!hasIncompatibility) {
    return false;
  }

  // Use SinceWarningSuppressor with all three strategies
  const suppressor = new SinceWarningSuppressor(
    checker.getSdkVersion(),
    checker.getMinApiVersion(),
    typeChecker,
    declaration
  );

  if (suppressor.isApiVersionHandled(node)) {
    return false;
  }

  config.message = SINCE_TAG_CHECK_ERROR
    .replace('$SINCE1', checker.getMinApiVersion())
    .replace('$SINCE2', checker.getSdkVersion());

  return true;
}

/**
 * Default value checker implementation (fallback).
 * Compares two versions using point system without format validation.
 * 
 * Trigger scenes:
 * - 0: Generating warning
 * - 1: Suppressing warning (target is open source - ifStatement number like 20 in: if (apiSDKVersion > 20))
 * - 2: Suppressing warning (target is other - ifStatement number like 60000 in: if (distributeApiVersion > 60000))
 * 
 * @param sinceVersion - Required API version
 * @param targetVersion - Available/current version  
 * @param _triggerScene - Trigger scenario (unused in default implementation)
 * @returns Validation result
 */
export function defaultValueChecker(
  sinceVersion: string,
  targetVersion: string,
  _triggerScene: number
): VersionValidationResult {
  const triggerResult = comparePointVersion(targetVersion, sinceVersion);
  const isTargetGreaterOrEqual = triggerResult >= 0;

  return {
    result: isTargetGreaterOrEqual,
    message: isTargetGreaterOrEqual
      ? 'Version requirement satisfied'
      : 'API version requirement not met'
  };
}

/**
 * Default format checker for versions with decimal points (e.g., "19", "19.1", "19.1.2").
 * 
 * Rules:
 * - Major version: 1-999 (no leading zero)
 * - Minor version: 0-999 (optional)
 * - Patch version: 0-999 (optional)
 * 
 * Valid examples: "19", "19.1", "19.1.2"
 * Invalid examples: "0", "01", "1000", "19.1.2.3"
 * 
 * @param since - Version string to validate
 * @returns true if format is valid
 */
export function defaultFormatChecker(since: string): boolean {
  const regex = /^(?:[1-9]\d{0,2}|[1-9]\d{0,2}\.\d{1,3}\.\d{1,3}|[1-9]\d{0,2}\.\d{1,3}\.\d{1,3}\([1-9]\d{0,2}\)|[1-9]\d?\.\d{1,2}\.\d{1,2})$/;
  return regex.test(since);
}

/**
 * Format checker for integer and multi-segment format (MSF) versions (e.g., "19", "20", "26.0.0").
 * Used for OpenHarmony runtime.
 * 
 * Rules:
 * - Major version only: 1-999 (no leading zero)
 * 
 * Valid examples: "19", "20", "999", "26.0.0"
 * Invalid examples: "0", "01", "1000", "19.1", "26.0"
 * 
 * @param since - Version string to validate
 * @returns true if format is valid
 */
export function defaultFormatCheckerCompatibileIntegerAndMSF(since: string): VersionValidationResult {
  const compatibileReg = /^(?:[1-9]\d{0,2}|[1-9]\d?\.\d{1,2}\.\d{1,2})$/;
  if (compatibileReg.test(since)) {
    if (!checkMSFVersionMajor(since)) {
      return {
        result: false,
        message: AVAILABLE_VERSION_FORMAT_ERROR
      }
    }
    return {
      result: true
    }
  } else {
    return {
      result: false,
      message: AVAILABLE_VERSION_FORMAT_ERROR
    }
  }
}

/**
 * Determine if the MSF version is less than 26, Integer does not make judgments.
 * @param since - Version string to validate
 * @returns When MSF (26.0.0) is less than 26, return false and do not judge integers
 */
export function checkMSFVersionMajor(since: string): boolean {
  const msfVersionReg: RegExp = /^[1-9]\d?\.\d{1,2}\.\d{1,2}|[1-9]\d?\.\d{1,2}\.\d{1,2}\(\d+\)$/;
  if (msfVersionReg.test(since)) {
    const majorVersion = parseInt(since.split('.')[0]);
    if (majorVersion < MSF_INTEGER_VERSION) {
      return false;
    }
  }
  return true;
}

/**
 * Determine if the Integer version is more than 26.
 * @param since - Version string to validate
 * @returns When Integer is more than 26, return false
 */
export function checkIntegerMoreVersion(since: string): boolean {
  const IntVersionReg: RegExp = /^(?:[1-9]\d{0,2})$/;
  if (IntVersionReg.test(since)) {
    if (Number(since) >= MSF_INTEGER_VERSION) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if current runtime is OpenHarmony.
 * 
 * @returns true if runtime OS is OpenHarmony
 */
export function isOpenHarmonyRuntime(): boolean {
  return projectConfig.runtimeOS === RUNTIME_OS_OH;
}

/**
 * Initializes comparison functions by loading external plugins and setting up fallbacks.
 * 
 * Process:
 * 1. Detect available OS names from loaded SDK plugins
 * 2. Try to load external plugins for each OS/tag combination
 * 3. If plugin loading fails, use default implementations
 * 4. Cache all functions for quick access
 * 
 * Plugin key format: {osName}/{tag}/{type}
 * - CompatibilityCheck → valueChecker
 * - FormatValidation → formatChecker
 */
export function initComparisonFunctions(): void {
  if (comparisonFunctions.valueChecker.size !== 0) {
    return;
  }
  const tags = ['since', 'available'];
  const osName = projectConfig.runtimeOS;
  for (const tag of tags) {
    // Initialize value checker (CompatibilityCheck)
    initValueChecker(osName, tag);
    // Initialize format checker (FormatValidation) - only for 'available'
    if (tag === 'available') {
      initFormatChecker(osName, tag);
    }
  }

}

/**
 * Initializes value checker for a specific OS/tag combination.
 * 
 * Supports both config formats:
 * - New format: {osName}/{tag}/CompatibilityCheck
 * - Old format: {osName}/{tag}
 * 
 * @param osName - OS name (e.g., "HarmonyOS", "OpenHarmony")
 * @param tag - Tag name ("since" or "available")
 */
export function initValueChecker(osName: string, tag: string): void {
  const cacheKey = `${osName}/${tag}`;

  // Skip if already initialized
  if (comparisonFunctions.valueChecker.has(cacheKey)) {
    return;
  }

  // Try new format first: {osName}/{tag}/CompatibilityCheck
  let formatKey = `${osName}/${tag}/CompatibilityCheck`;
  if (!externalApiCheckPlugin.has(formatKey)) {
    formatKey = `${osName}/${tag}`;
  }
  let plugins = externalApiCheckPlugin.get(formatKey);

  if (!plugins || plugins.length === 0) {
    comparisonFunctions.valueChecker.set(cacheKey, defaultValueChecker);
    return;
  }

  // Try to load external plugin
  for (const plugin of plugins) {
    try {
      const externalModule = require(plugin.path);
      const externalMethod = externalModule[plugin.functionName];

      if (typeof externalMethod === 'function') {
        comparisonFunctions.valueChecker.set(cacheKey, externalMethod);
        return;
      }
    } catch (error) {
    }
  }

  // Fallback to default
  comparisonFunctions.valueChecker.set(cacheKey, defaultValueChecker);
}

/**
 * Initializes format checker for a specific OS/tag combination.
 * 
 * @param osName - OS name (e.g., "OpenHarmony")
 * @param tag - Tag name (typically "available")
 */
export function initFormatChecker(osName: string, tag: string): void {
  const pluginKey = `${osName}/${tag}/FormatValidation`;
  const cacheKey = `${osName}/${tag}`;

  // Try to load external plugin
  const plugins = externalApiCheckPlugin.get(pluginKey);
  if (!plugins || plugins.length === 0) {
    comparisonFunctions.formatChecker.set(cacheKey, defaultFormatCheckerCompatibileIntegerAndMSF);
    return;
  }
  for (const plugin of plugins) {
    try {
      const externalModule = require(plugin.path);
      const externalMethod = externalModule[plugin.functionName];

      if (typeof externalMethod === 'function') {
        comparisonFunctions.formatChecker.set(cacheKey, externalMethod);
        return;
      }
    } catch (error) {
    }
  }

  // Fallback to default
  comparisonFunctions.formatChecker.set(cacheKey, defaultFormatCheckerCompatibileIntegerAndMSF);
}

/**
 * Gets the value checker function for current runtime.
 * 
 * @param tag - Tag name ("since" or "available")
 * @returns Value checker function
 */
export function getValueChecker(tag: string): ValueCheckerFunction {
  const runtimeOS = projectConfig.runtimeOS;
  const cacheKey = `${runtimeOS}/${tag}`;
  const checker = comparisonFunctions.valueChecker.get(cacheKey);

  return checker || defaultValueChecker;
}

/**
 * Gets the format checker function for current runtime.
 * 
 * @param tag - Tag name (typically "available")
 * @returns Format checker function
 */
export function getFormatChecker(tag: string = 'available'): FormatCheckerFunction {
  const runtimeOS = projectConfig.runtimeOS;
  const cacheKey = `${runtimeOS}/${tag}`;
  const checker = comparisonFunctions.formatChecker.get(cacheKey);

  return checker || defaultFormatCheckerCompatibileIntegerAndMSF;
}

/**
 * Call the closed source script to match the apiAvailable version number.
 * @param tag - check node
 * @param version  - check version
 * @returns Closed source matching results
 */
export function isCheckDistributionOSVersion(tag: string, version: string): DistributionOSApiAvailableVersionResult {
  const runtimeOS = projectConfig.runtimeOS;
  let distributionOSCheck: DistributionOSApiAvailableVersionResult = {
    valid: false,
    version: '',
    message: ''
  };
  const tagName: string = `${runtimeOS}/${tag}`;
  const externalCheckers = externalApiCheckPlugin.get(tagName);
  if (!externalCheckers || externalCheckers.length === 0) {
    return distributionOSCheck;
  }
  for (const plugin of externalCheckers) {
    try {
      const externalModule = require(plugin.path);
      const externalMethod = externalModule[plugin.functionName];

      if (typeof externalMethod === 'function') {
        distributionOSCheck = externalMethod(version);
      }
    } catch (error) {
      return distributionOSCheck;
    }
  }
  return distributionOSCheck;
}

/**
 * Determine the necessity of syscap check.
 * @param jsDocTags 
 * @param config 
 * @param node 
 * @param declaration 
 * @returns 
 */
export function checkSyscapAbility(jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem,
  node?: ts.Node, declaration?: ts.Declaration): boolean {
  let currentSyscapValue: string = '';
  for (let i = 0; i < jsDocTags.length; i++) {
    const jsDocTag: ts.JSDocTag = jsDocTags[i];
    if (jsDocTag && jsDocTag.tagName.escapedText.toString() === SYSCAP_TAG_CHECK_NAME) {
      currentSyscapValue = jsDocTag.comment as string;
      break;
    }
  }
  const defaultResult: boolean = projectConfig.syscapIntersectionSet &&
    !projectConfig.syscapIntersectionSet.has(currentSyscapValue);

  if (defaultResult) {
    const suppressor = new SyscapWarningSuppressor(jsDocTags, config);
    // 执行告警消除判断
    if (suppressor && suppressor.isApiVersionHandled(node)) {
      return false;
    }
    return true;
  }

  const externalCheckers = externalApiCheckerMap.get(SYSCAP_TAG_CHECK_NAME);
  if (!externalCheckers || externalCheckers.length === 0) {
    // 若不存在拓展校验器，直接返回结果
    return false;
  }
  for (let i = 0; i < externalCheckers.length; i++) {
    const checker = externalCheckers[i];
    if (!checker.check) {
      return false;
    }
    const extrenalCheckResult = checker.check(node, declaration, projectConfig);
    if (!extrenalCheckResult.checkResult) {
      return false;
    }
    config.message = extrenalCheckResult.checkMessage;
  }
  const suppressor = new SyscapWarningSuppressor(jsDocTags, config);
  // 执行告警消除判断
  if (suppressor && suppressor.isApiVersionHandled(node)) {
    return false;
  }
  return true;
}

interface CheckSyscapResult {
  checkResult: boolean;
  checkMessage?: string[];
}

interface ConfigPermission {
  requestPermissions: Array<{ name: string }>;
  definePermissions: Array<{ name: string }>;
}

interface PermissionsConfig {
  permission: ConfigPermission,
  requestPermissions: string[],
  definePermissions: string[],
}
/**
 * configure permissionInfo to this.share.projectConfig
 *
 * @param config this.share.projectConfig
 */
export function configurePermission(config: PermissionsConfig): void {
  const permission: ConfigPermission = config.permission;
  config.requestPermissions = [];
  config.definePermissions = [];
  if (permission.requestPermissions) {
    config.requestPermissions = getNameFromArray(permission.requestPermissions);
  }
  if (permission.definePermissions) {
    config.definePermissions = getNameFromArray(permission.definePermissions);
  }
}

function getNameFromArray(array: Array<{ name: string }>): string[] {
  return array.map((item: { name: string }) => {
    return String(item.name);
  });
}

/**
 *  Determine the necessity of permission check
 *
 * @param {ts.JSDocTag[]} jsDocTags
 * @param {ts.JsDocNodeCheckConfigItem} config
 * @param {ts.Node} node
 * @returns {boolean}
 */
export function checkPermissionValue(jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem,
  node?: ts.Node): boolean {
  const jsDocTag: ts.JSDocTag = jsDocTags.find((item: ts.JSDocTag) => {
    return item.tagName.getText() === PERMISSION_TAG_CHECK_NAME;
  });
  if (!jsDocTag) {
    return false;
  }
  const comment: string = typeof jsDocTag.comment === 'string' ?
    jsDocTag.comment :
    ts.getTextOfJSDocComment(jsDocTag.comment);
  config.message = PERMISSION_TAG_CHECK_ERROR.replace('$DT', comment);
  if (comment === '' || JsDocCheckService.validPermission(comment, permissionsArray)) {
 	  return false;
 	}
 	const suppressor = new PermissionWarningSuppressor();
 	if (suppressor.isApiVersionHandled(node)) {
 	  return false;
 	}
 	return true;
}

/**
 * custom condition check
 * 
 * This logic is not enabled
 * 
 * @param { ts.FileCheckModuleInfo } jsDocFileCheckedInfo
 * @param { ts.JsDocTagInfo[] } jsDocTagInfos
 * @param { ?ts.JSDoc[] } jsDocs
 * @returns
 */
export function getJsDocNodeConditionCheckResult(jsDocFileCheckedInfo: ts.FileCheckModuleInfo, jsDocTagInfos: ts.JsDocTagInfo[], jsDocs?: ts.JSDoc[]):
  ts.ConditionCheckResult {
  let result: ts.ConditionCheckResult = {
    valid: true
  };
  if (jsDocFileCheckedInfo.tagName.includes(SYSCAP_TAG_CHECK_NAME)) {
    result = checkSyscapCondition(jsDocTagInfos);
  } else if (jsDocFileCheckedInfo.tagName.includes(SINCE_TAG_NAME) && jsDocs) {
    result = checkSinceCondition(jsDocs);
  }
  return result;
}

/**
 * syscap condition check
 * 
 * This logic is not enabled
 * 
 * @param { ts.JSDoc[] } jsDocs
 * @returns { ts.ConditionCheckResult }
 */
function checkSyscapCondition(jsDocs: ts.JsDocTagInfo[]): ts.ConditionCheckResult {
  const result: ts.ConditionCheckResult = {
    valid: true
  };
  let currentSyscapValue: string = '';
  for (let i = 0; i < jsDocs.length; i++) {
    const jsDocTag: ts.JsDocTagInfo = jsDocs[i];
    if (jsDocTag.name === SYSCAP_TAG_CHECK_NAME) {
      currentSyscapValue = jsDocTag.text as string;
      break;
    }
  }
  if (!projectConfig.syscapIntersectionSet || !projectConfig.syscapUnionSet) {
    return result;
  }
  if (!projectConfig.syscapIntersectionSet.has(currentSyscapValue) && projectConfig.syscapUnionSet.has(currentSyscapValue)) {
    result.valid = false;
    result.type = ts.DiagnosticCategory.Warning;
    result.message = SYSCAP_TAG_CONDITION_CHECK_WARNING;
  } else if (!projectConfig.syscapUnionSet.has(currentSyscapValue)) {
    result.valid = false;
    // TODO: fix to error in the feature
    result.type = ts.DiagnosticCategory.Warning;
    result.message = SYSCAP_TAG_CHECK_WARNING.replace('$DT', projectConfig.deviceTypesMessage);
  }
  return result;
}

/**
 * version condition check
 * 
 * This logic is not enabled
 * 
 * @param { ts.JSDoc[] } jsDocs
 * @returns { ts.ConditionCheckResult }
 */
function checkSinceCondition(jsDocs: ts.JSDoc[]): ts.ConditionCheckResult {
  const result: ts.ConditionCheckResult = {
    valid: true
  };
  if (!jsDocs || !jsDocs[0] || !projectConfig.compatibleSdkVersion) {
    return result;
  }
  const minVersion: string = getMinVersion(jsDocs);
  const hasSince: boolean = minVersion !== '';

  const compatibleSdkVersion: string = projectConfig.compatibleSdkVersion.toString();

  if (hasSince && comparePointVersion(compatibleSdkVersion, minVersion) === -1) {
    result.valid = false;
    result.type = ts.DiagnosticCategory.Warning;
    result.message = SINCE_TAG_CHECK_ERROR.replace('$SINCE1', minVersion).replace('$SINCE2', compatibleSdkVersion);
  }
  return result;
}

/**
 * version condition check, print error message
 * 
 * This logic is not enabled
 * 
 * @param { ts.CallExpression } node
 * @param { string } specifyFuncName
 * @param { string } targetVersion
 * @param { ?ts.JSDoc[] } jsDocs
 * @returns { boolean }
 */
function checkVersionConditionValidCallback(node: ts.CallExpression, specifyFuncName: string, targetVersion: string, jsDocs?: ts.JSDoc[]): boolean {
  if (ts.isIdentifier(node.expression) && node.arguments.length === 1 && node.expression.escapedText.toString() === specifyFuncName) {
    const expression = node.arguments[0];
    if (ts.isStringLiteral(expression) && jsDocs && comparePointVersion(expression.text.toString(), getMinVersion(jsDocs)) !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * syscap condition check, print error message
 * 
 * This logic is not enabled
 * 
 * @param { ts.CallExpression } node
 * @param { string } specifyFuncName
 * @param { string } tagValue
 * @param { ?ts.JSDoc[] } jsDocs
 * @returns { boolean }
 */
function checkSyscapConditionValidCallback(node: ts.CallExpression, specifyFuncName: string, tagValue: string, jsDocs?: ts.JSDoc[]): boolean {
  if (ts.isIdentifier(node.expression) && node.arguments.length === 1 && node.expression.escapedText.toString() === specifyFuncName) {
    const expression = node.arguments[0];
    if (ts.isStringLiteral(expression) && tagValue === expression.text) {
      return true;
    } else if (ts.isIdentifier(expression)) {
      const typeChecker: ts.TypeChecker | undefined = CurrentProcessFile.getChecker();
      if (!typeChecker) {
        return false;
      }
      const arguSymbol: ts.Symbol | undefined = typeChecker.getSymbolAtLocation(expression);
      return arguSymbol && arguSymbol.valueDeclaration && ts.isVariableDeclaration(arguSymbol.valueDeclaration) &&
        arguSymbol.valueDeclaration.initializer && ts.isStringLiteral(arguSymbol.valueDeclaration.initializer) &&
        arguSymbol.valueDeclaration.initializer.text === tagValue;
    }
  }
  return false;
}

/**
 * get minversion
 * 
 * This logic is not enabled
 * 
 * @param { ts.JSDoc[] } jsDocs 
 * @returns string
 */
function getMinVersion(jsDocs: ts.JSDoc[]): string {
  if (!jsDocs || !jsDocs[0]) {
    return '';
  }
  let minVersion: string = '';
  jsDocs.some((doc: ts.JSDoc) => {
    return doc.tags?.some((tag: ts.JSDocTag) => {
      if (tag.tagName.escapedText.toString() === SINCE_TAG_NAME) {
        minVersion = tag.comment.toString();
        return true;
      }
      return false;
    });
  });
  return minVersion;
}

/**
 * compare point version
 * @param { string } firstVersion
 * @param { string } secondVersion
 * @returns { number }
 */
export function comparePointVersion(firstVersion: string, secondVersion: string): ComparisonResult {
  const parseVersion = (version: string): number[] => {
    const trimmed = version.trim();
    if (trimmed.includes('.')) {
      const parts = trimmed.split('.').map(p => parseInt(p, 10));
      return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
    }
    const num = parseInt(trimmed, 10);
    return [num, 0, 0];
  };
  const p1 = parseVersion(firstVersion);
  const p2 = parseVersion(secondVersion);

  for (let i = 0; i < 3; i++) {
    if (Number.isNaN(p1[i]) || Number.isNaN(p2[i])) {
      return ComparisonResult.Less;
    };
    if (p1[i] > p2[i]) {
      return ComparisonResult.Greater;
    }
    if (p1[i] < p2[i]) {
      return ComparisonResult.Less;
    }
  }

  return ComparisonResult.Equal;
}

/**
 * Restore version number to placeholder and match error code.
 * @param messageRegex - Message containing actual version number
 * @returns error message or undefined
 */
function matchWithPlaceholders(messageRegex: string): string {
  return messageRegex.replace(/version\s+(?:(\S+))/, 'version $SINCE1.').replace(/version\s+is\s+(?:(\S+))/, 'version is $SINCE2.');
}

/**
 * Handle the error information passed over from tsc.
 * @param positionMessage - Location of error message
 * @param message - Error message
 * @returns - Error message processed locally
 */
function buildErrorDiagnostic(positionMessage: string, message: string): BuildDiagnosticInfo | undefined {
  let description: string = '';
  let diagnosticInfo: Omit<SdkHvigorLogInfo, 'cause' | 'position'> | undefined;
  const runTimeOS: string = projectConfig.runtimeOS;
  const messageRegex: string = message.replace(/'[^']*'/g, '\'{0}\'').trim();
  const sinceRegex: RegExp = /^The '.+' API is .+ since SDK version .+\. However, the current compatible SDK version is .+\.$/;
  const apiAvailableRegex: RegExp = /^Invalid .+ version\.$/;
  if (sinceRegex.test(messageRegex)) {
    diagnosticInfo = ERROR_CODE_INFO.get(matchWithPlaceholders(messageRegex));
  } else if (apiAvailableRegex.test(messageRegex)) {
    diagnosticInfo = ERROR_CODE_INFO.get(messageRegex.replace(runTimeOS, '$RUNTIMEOS'));
  } else {
    diagnosticInfo = ERROR_CODE_INFO.get(messageRegex.replace(/\r\n/g, '\\n'));
  }

  if (!diagnosticInfo || !diagnosticInfo.code) {
    return undefined;
  }

  if (diagnosticInfo.code === '11706011' || diagnosticInfo.code === '11706012') {
    const apiVersion: RegExpMatchArray = messageRegex.match(/version\s+([\S+.]+(?=\. However,))/i);
    if (apiVersion) {
      description = diagnosticInfo.description.replace(/\$ApiVersion/g, `${apiVersion[1].trim()}`);
    } else {
      description = diagnosticInfo.description;
    }
  } else {
    description = diagnosticInfo.description;
  }

  return new BuildDiagnosticInfo()
    .setCode(Number(diagnosticInfo.code))
    .setDescription(description)
    .setPositionMessage(positionMessage)
    .setMessage(message)
    .setSolutions(diagnosticInfo.solutions);
}

/**
 * Handle SDK error messages and output Hvigor format information.
 * @param positionMessage - Location of error message
 * @param message - Error message
 * @returns - Return error information in hvigor format
 */
export function sdkBuildErrorInfoFromDiagnostic(positionMessage: string, message: string): SdkHvigorErrorInfo | undefined {
  return sdkTransfromErrorCode(buildErrorDiagnostic(positionMessage, message));
}

/**
 * Format the error information into information in the hvigor format.
 * @param diagnostic - Locally processed error message
 * @returns - Return error information in hvigor format
 */
function sdkTransfromErrorCode(diagnostic: BuildDiagnosticInfo | undefined): SdkHvigorErrorInfo | undefined {
  if (!diagnostic || !diagnostic.code) {
    return undefined;
  }
  return new SdkHvigorErrorInfo()
    .setCode(String(diagnostic.getCode()))
    .setDescription(diagnostic.description)
    .setCause(diagnostic.getMessage())
    .setPosition(diagnostic.getPositionMessage())
    .setSolutions(diagnostic.getSolutions());
}

/**
 * Parse a version string into structured format.
 * 
 * Supported formats:
 * - Plain number: "21" → { version: "21" }
 * - Dotted: "5.0.0" → { version: "5.0.0" }
 * - With parentheses: "5.0.3(22)" → { version: "5.0.3(22)" }
 * - OS-prefixed: "OpenHarmony 21" → { os: "OpenHarmony", version: "21" }
 * - Combined: "OpenHarmony 22.0.0" → { os: "OpenHarmony", version: "22.0.0" }
 * 
 * @param raw - Raw version string to parse
 * @returns Parsed version object, or null if format is invalid
 */
export function parseVersionString(raw: string): ParsedVersion | null {
  const trimmed = raw.trim();

  // 分割前两个元素（无论是否有空格，统一处理）
  const [firstPart, secondPart] = trimmed.split(/\s+/, 2);

  // 处理无空格的情况（secondPart 会是 undefined）
  const os = secondPart ? firstPart : RUNTIME_OS_OH;
  const version = secondPart ?? firstPart; // 无空格时用整个 trimmed 作为版本

  return {
    os: os,
    version: version,
    raw: raw,
    formatVersion: `${os} ${version}`
  };
}

/**
 * Extract the minApiVersion property from an @Available decorator.
 * 
 * This method parses the decorator's object literal to find the minApiVersion property.
 * 
 * Supported decorator formats:
 * ```typescript
 * @Available({ minApiVersion: "21" })
 * @Available({ minApiVersion: "5.0.0" })
 * @Available({ minApiVersion: "5.0.3(22)" })
 * @Available({ minApiVersion: "OpenHarmony 5.0.3(22)" })
 * ```
 * 
 * The method handles edge cases:
 * - Empty properties array (tries parsing raw text)
 * - String literal property names vs identifiers
 * - Numeric literals vs string literals for version values
 * 
 * @param dec - The decorator node to extract from
 * @returns Parsed version object, or null if not an @Available decorator
 */
export function extractMinApiFromDecorator(dec: ts.Decorator | ts.Annotation): ParsedVersion | null {
  // Verify it's a call expression: @Available({ ... })
  if (!ts.isCallExpression(dec.expression)) {
    return null;
  }
  const callExpr = dec.expression;
  // Verify the decorator name is an identifier
  if (!ts.isIdentifier(callExpr.expression)) {
    return null;
  }
  // Check if it's specifically @Available
  if (callExpr.expression.text !== 'Available') {
    return null;
  }
  // Verify there's at least one argument (the config object)
  if (callExpr.arguments.length === 0) {
    return null;
  }
  const arg = callExpr.arguments[0];
  // The argument must be an object literal expression
  if (!ts.isObjectLiteralExpression(arg)) {
    return null;
  }
  // Edge case: If properties array is empty (malformed AST), try parsing raw text
  // This can happen with certain TypeScript compiler configurations
  if (arg.properties.length === 0) {
    const text = arg.getText();
    // Allow leading spaces, consecutive spaces in the middle, and trailing spaces.
    const match = /\s*minApiVersion\s*:\s*['"]([^'"]+)['"]\s*/.exec(text);
    if (match) {
      return parseVersionString(match[1]);
    }
    return null;
  }
  // Normal case: Parse properties from the object literal
  for (const prop of arg.properties) {
    const res = processProp(prop);
    if (res) {
      return res;
    }
  }
  return null; // minApiVersion property not found
}

export function processProp(prop: ts.ObjectLiteralElementLike): ParsedVersion | null {
  // Only process property assignments (key: value)
  if (ts.isPropertyAssignment(prop)) {
    // Extract property name - handle both identifier and string literal names
    const propName = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : prop.name.getText().replace(/['"]/g, '');
    // Check if this is the minApiVersion property
    if (propName === 'minApiVersion') {
      const value = prop.initializer;
      // Handle string literal: "21", "5.0.0", etc.
      if (ts.isStringLiteral(value)) {
        return parseVersionString(value.text);
      }
      // Handle numeric literal: 21 (converted to string)
      if (ts.isNumericLiteral(value)) {
        return parseVersionString(value.text.toString());
      }
    }
  }
  return null;
}

/**
 * Recursively search for decorators named @Available in the node and its parent node.
 * @param node declaration
 * @param predicate Function for validating decorators
 * @returns The array of @Available decorators found; if none exist, return an empty array.
 */
export function getValidDecoratorFromNode(node: ts.Node | ts.Declaration, predicate: (parent: ts.Decorator) => boolean): ts.Decorator | null {
  const decoratorArray = [];
  if (ts.canHaveDecorators(node)) {
    decoratorArray.push(...(ts.getAnnotations(node)) || []);
  }
  if (ts.canHaveIllegalDecorators(node)) {
    decoratorArray.push(...(ts.getAnnotationsFromIllegalDecorators(node)) || []);
  }
  const validDecorator = decoratorArray.find(decorator => {
    return predicate(decorator);
  });

  if (validDecorator) {
    return validDecorator;
  }
  const parentNode = node.parent;

  return parentNode ? getValidDecoratorFromNode(parentNode, predicate) : null;
}

/**
 * The extension method must be converted to full format.
 * The local default method does not support format conversion, so the converted version field is used for comparison.
 * @param curAvailableVersion 
 * @returns 
 */
export function getVersionByValueChecker(curAvailableVersion: ParsedVersion, checker: ValueCheckerFunction): string {
  if (checker === defaultValueChecker) {
    return curAvailableVersion.version;
  } else {
    return curAvailableVersion.formatVersion;
  }
}

export function isSourceRetentionDeclarationValid(annoDecl: ts.AnnotationDeclaration): boolean {
  if (!annoDecl) {
    return false;
  }
  if (ts.isIdentifier(annoDecl.name) && annoDecl.name.escapedText.toString() !== 'Available' && annoDecl.name.escapedText.toString() !== 'SuppressWarnings') {
    return false;
  }

  const fileName: string = path.normalize(annoDecl.getSourceFile()?.fileName);
  if (fileName.endsWith(AVAILABLE_FILE_NAME)) {
    return true;
  }
  return false;
}

export function isSourceRetentionAnnotationContentValid(annotation: ts.Annotation): ts.ConditionCheckResult {
  let result: ts.ConditionCheckResult = {
    valid: true
  }
  if (!annotation || !annotation.annotationDeclaration) {
    return result;
  }
  try {
    if (!ts.isCallExpression(annotation.expression) || !ts.isObjectLiteralExpression(annotation.expression.arguments[0])) {
      return result;
    }
    const arg = annotation.expression.arguments[0];
    for (const prop of arg.properties) {
      if (!ts.isPropertyAssignment(prop)) {
        continue;
      }
      let propName = !prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? prop.name.text : prop.name.getText().replace(/['"]/g, '');
      if (propName !== 'minApiVersion' || !ts.isStringLiteral(prop.initializer)) {
        continue;
      }
      let minApiVersion = prop.initializer.text;

      if (minApiVersion === null || minApiVersion === undefined) {
        minApiVersion = '';
      }
      let parseVersion = parseVersionString(minApiVersion);
      let checkResult = checkFormatResult(parseVersion);
      if (checkResult) {
        return checkResult;
      }
      // Verify the nearest parent node of the current child node that utilises the `@available` annotation.
      // Check whether the parent node's version number is lower than that of the child node. If higher, trigger an alert.

      let higherVersion = hasLargerVersionInParentNode(annotation.parent, parseVersion);
      if (higherVersion) {
        let msg = AVAILABLE_SCOPE_ERROR
          .replace('$VERSION', higherVersion.version);
        return {
          valid: false,
          message: msg,
          type: ts.DiagnosticCategory.Warning
        }
      }
    }
  } catch (e) {
    return result;
  }
  return result;
}

/**
 * Determine whether the current apiAvailable interface complies with the specifications.
 * 
 * runtimeOS:OpenHarmony
 * valid sample
 * apiAvailable('26.0.0')
 * apiAvailable('27.0.0')
 * 
 * Invalid sample
 * apiAvailable('25')
 * apiAvailable('27')
 * apiAvailable('25.0.0')
 * apiAvailable('6.1.1')
 * apiAvailable('6.1.1(24)')
 * 
 * runtimeOS:DistributionOS
 * valid sample
 * apiAvailable('6.1.1')
 * apiAvailable('6.1.1(24)')
 * 
 * Invalid sample
 * apiAvailable('25')
 * apiAvailable('26')
 * apiAvailable('27')
 * apiAvailable('25.0.0')
 * 
 * @param node  - current node
 * @returns Return the result of whether it meets the specifications
 */
export function isApiAvailableVersionSpecifications(node: ts.CallExpression): ts.ConditionCheckResult {
  let result: ApiAvailableResult = {
    valid: true,
    message: APIAVAILABLE_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error
  }
  const apiAvailableRegex = /^\bdeviceInfo\.apiAvailable\b/g;
  let nodeText: string = node.getText() || node.getFullText();

  if (!apiAvailableRegex.test(nodeText)) {
    return result;
  }

  if (!ts.isCallExpression(node)) {
    return result;
  }
  
  if (!node.arguments || node.arguments.length !== 1) {
    result.valid = false;
    return result;
  }

  const compatibileReg: RegExp = /^(?:[1-9]\d{0,2}|[1-9]\d?\.\d{1,2}\.\d{1,2}|[1-9]\d?\.\d{1,2}\.\d{1,2}\(\d+\))$/;
  const sinceValue: string = node.arguments[0].getText().trim();
  const sinceFormat: string = sinceValue.replace(/[\'|\"|\`]/g,'');
  const sincePoint: string[] = sinceFormat.split('.');
  if (!compatibileReg.test(sinceFormat)) {
    result.message = APIAVAILABLE_OPENHARMONY_CHECK_ERROR;
    result.valid = false;
    return result;
  }
  const isSinceVersionType: boolean = /^(['"`])([^'"`]*)\1$/.test(sinceValue);
  if (isSinceVersionType) {
    result = checkCharScene(sincePoint, sinceFormat);
  } else {
    if (!checkIntegerMoreVersion(sinceFormat)) {
      result.message = APIAVAILABLE_OPENHARMONY_CHECK_ERROR;
      result.valid = false;
    }
  }

  return result;
}

/**
 * Determine whether the string scenario complies with the specifications.
 * 
 * OpenHarmony project
 * valid sample
 * apiAvailable('26.0.0')
 * 
 * Invalid sample
 * apiAvailable('26')
 * apiAvailable('25.0.0')
 * 
 * distributionOS project
 * valid sample
 * apiAvailable('6.1.1')
 * apiAvailable('6.1.1(24)')
 * 
 * Invalid sample
 * apiAvailable('6.8.8')
 * apiAvailable('25.0.0')
 * 
 * @param sincePoint MSF version
 * @param sinceFormat del quotation mark version
 * @returns standardized results
 */
function checkCharScene(sincePoint: string[], sinceFormat: string): ApiAvailableResult {
  let result: ApiAvailableResult = {
    valid: true,
    message: APIAVAILABLE_CHECK_ERROR,
    type: ts.DiagnosticCategory.Error
  }
  if (sincePoint.length === 1) {
    result.message = APIAVAILABLE_OPENHARMONY_CHECK_ERROR;
    result.valid = false;
    return result;
  }
  if (isOpenHarmonyRuntime()) {
    if (!checkMSFVersionMajor(sinceFormat)) {
      result.message = APIAVAILABLE_OPENHARMONY_CHECK_ERROR;
      result.valid = false;
    }
  } else {
    if (!checkMSFVersionMajor(sinceFormat)) {
      const distributionOSCheck: DistributionOSApiAvailableVersionResult = isCheckDistributionOSVersion(SINCE_TAG_NAME, sinceFormat);
      if (!distributionOSCheck.valid) {
        result.message = distributionOSCheck.message;
        result.valid = false;
      }
    }
  }

  return result;
}

export const isAvailableDecorator = (decorator: ts.Decorator): boolean => {
  if (!decorator) {
    return false;
  }
  let decoratorName: string = '';
  if (ts.isCallExpression(decorator.expression) && ts.isIdentifier(decorator.expression.expression)) {
    decoratorName = decorator.expression.expression.text;
  }
  if (ts.isIdentifier(decorator.expression)) {
    decoratorName = decorator.expression.text;
  }
  if (decoratorName !== 'Available') {
    return false
  }
  let parseVersion = extractMinApiFromDecorator(decorator);
  if (!parseVersion) {
    return false;
  }
  const isValidFormat = parseVersion.os === RUNTIME_OS_OH
    ? defaultFormatCheckerCompatibileIntegerAndMSF(parseVersion.version)
    : getFormatChecker(AVAILABLE_TAG_NAME)(parseVersion.formatVersion);

  if (!isValidFormat || !isValidFormat.result) {
    return false;
  }
  return true;
};
/**
 * Check whether a higher version exists in the parent node
 * @param node check node
 * @param curAvailableVersion currrent version
 * @returns true if higher version exist.
 */
function hasLargerVersionInParentNode(node: ts.Node, curAvailableVersion: ParsedVersion): ParsedVersion | null {
  if (!node || !node.parent) {
    return null;
  }

  const decorator: ts.Decorator | null = getValidDecoratorFromNode(node.parent, isAvailableDecorator);
  if (decorator === null) {
    return null;
  }

  const availableVersion = extractMinApiFromDecorator(decorator);
  if (!availableVersion) {
    return null;
  }

  if (!compareVersions(availableVersion, curAvailableVersion)) {
    return availableVersion;
  }

  return null;
}

/**
 * Verify that the format complies with business requirements.
 * @param parseVersion Version numbers requiring verification
 * @returns check result that contains message and diagnosticCategory
 */
export function checkFormatResult(parseVersion: ParsedVersion | null): ts.ConditionCheckResult | null {
  let checkResult: VersionValidationResult;
  if (parseVersion.os === RUNTIME_OS_OH) {
    checkResult = defaultFormatCheckerCompatibileIntegerAndMSF(parseVersion.version);
  } else if (parseVersion.os === projectConfig.runtimeOS) {
    checkResult = getFormatChecker()(parseVersion.formatVersion);
  } else {
    let msg = AVAILABLE_OSNAME_ERROR
      .replace('$RUNTIMEOS', projectConfig.runtimeOS)
      .replace('$OSNAME', parseVersion.os);
    return {
      valid: false,
      message: msg,
      type: ts.DiagnosticCategory.Error
    }
  }
  if (checkResult && !checkResult.result) {
    let msg = AVAILABLE_VERSION_FORMAT_ERROR_PREFIX
      .replace('$RUNTIMEOS', projectConfig.runtimeOS)
      .replace('$VERSION', parseVersion.version);
    return {
      valid: false,
      message: checkResult.message ? `${msg} ${checkResult.message}` : `${msg}`,
      type: ts.DiagnosticCategory.Error
    }
  }
  return null;
}

export function compareVersions(parentAvailableVersion: ParsedVersion, curAvailableVersion: ParsedVersion): boolean {
  try {
    // Determine scenario based on version format
    if (!parentAvailableVersion || !curAvailableVersion) {
      return false;
    }
    const scenario = curAvailableVersion.os === RUNTIME_OS_OH ? ComparisonSenario.SuppressByOHVersion : ComparisonSenario.SuppressByOtherOSVersion;

    let valueResult: VersionValidationResult;
    let valueChecker = getValueChecker(AVAILABLE_TAG_NAME);
    if (valueChecker === defaultValueChecker) {
      valueResult = valueChecker(parentAvailableVersion.version, curAvailableVersion.version, scenario);
    } else {
      valueResult = valueChecker(parentAvailableVersion.formatVersion, curAvailableVersion.formatVersion, scenario);
    }

    return valueResult ? valueResult.result : false;

  } catch (error) {
    return false;
  }
}

/**
 * 判断节点所在的工程目录文件内容中是否包含@Available字符串
 * @param node 待校验的节点
 * @returns 如果是工程目录文件且存在@Available返回true，否则返回false
 */
export function checkFileHasAvailableByFileName(sourceFileName: string): boolean {
  if (!sourceFileName) {
    return false;
  }
  // Check Available info cache
  if (fileAvailableCheckPlugin.has(sourceFileName)) {
    const hasAvailale = fileAvailableCheckPlugin.get(sourceFileName)!;
    if (!hasAvailale) {
      return false;
    }
  } else {
    try {
      const isProjectFile = path.normalize(sourceFileName).startsWith(projectConfig.projectRootPath)
      if (!isProjectFile) {
        fileAvailableCheckPlugin.set(sourceFileName, false);
        return false;
      }
      const fileContent: string = fs.readFileSync(sourceFileName, { encoding: 'utf-8' });
      const availableContentChecker = /@Available/.test(fileContent);
      fileAvailableCheckPlugin.set(sourceFileName, availableContentChecker);
      if (!availableContentChecker) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
  return true;
}

/**
 * Obtaining the alarm categort of the @since tag
 * 
 * @param sinceErrorLevel - Configured error level
 * @returns TypeScript alarm type
 */
function getSinceDiagnosticType(sinceErrorLevel?: string): ts.DiagnosticCategory {
  if (!sinceErrorLevel) {
    return ts.DiagnosticCategory.Warning;
  }

  return SINCE_LEVEL_CONFIG.get(sinceErrorLevel) || ts.DiagnosticCategory.Warning;
}

/**
 * Check if the call expression is an apiAvailable statement
 * @param node Call expression node
 * @returns true if it's an apiAvailable statement, false otherwise
 */
export function isApiAvailableStatement(node: ts.CallExpression): boolean {
  const checker: ts.TypeChecker | undefined = CurrentProcessFile.getChecker();
  if (checker) {
    const type: ts.Type | ts.Type[] = findNonNullType(checker.getTypeAtLocation(node.expression));
    if (Array.isArray(type)) {
      return false;
    }
    if (type.symbol && type.symbol.valueDeclaration) {
      const symbolFileName: string = type.symbol.valueDeclaration.getSourceFile().fileName;
      // @ts-ignore
      const symbolName: string = type.symbol.valueDeclaration.name.escapedText.toString();
      if (symbolFileName.endsWith(SDK_CONSTANTS.DEVICE_INFO_PACKAGE) && symbolName === SDK_CONSTANTS.OPEN_SOURCE_APIAVAILABLE_INFO) {
        return true;
      }
    }
  }
  return false;
}