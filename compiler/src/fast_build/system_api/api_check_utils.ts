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
  externalApiMethodPlugin
} from '../../../main';
import {
  LogType,
  LogInfo,
  IFileLog,
  CurrentProcessFile,
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
  CROSSPLATFORM_TAG_CHECK_ERROER,
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
  ATOMICSERVICE_TAG_CHECK_ERROER,
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
  ERROR_DESCRIPTION,
  AVAILABLE_DECORATOR_WARNING,
  VersionValidationResult,
  ValueCheckerFunction,
  FormatCheckerFunction,
  comparisonFunctions,
  AVAILABLE_FILE_NAME
} from './api_check_define';
import { JsDocCheckService } from './api_check_permission';
import { SinceJSDocChecker } from './api_checker/since_version_checker';
import { AvailableAnnotationChecker } from './api_checker/available_version_checker';
import { SinceWarningSuppressor } from './api_validator/since_warning_suppressor';
import { AvailableWarningSuppressor } from './api_validator/available_warning_suppressor';


/**
 * bundle info
 *
 * @interface BundleInfo
 */
interface BundleInfo {
  bundlePath: string;
  bundleVersion: string;
}

export interface CheckValidCallbackInterface {
  (jsDocTag: ts.JSDocTag, config: ts.JsDocNodeCheckConfigItem): boolean;
}

export interface CheckJsDocSpecialValidCallbackInterface {
  (jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem, node?: ts.Node): boolean;
}

export interface checkConditionValidCallbackInterface {
  (node: ts.CallExpression, specifyFuncName: string, importSymbol: string, jsDocs?: ts.JSDoc[]): boolean;
}

export interface checkHvigorLoggerValidCallbackInterface {
  (config: ts.JsDocNodeCheckConfigItem, diagnostic: ts.DiagnosticWithLocation): void
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
 * @param {string[]} tagName - tag name
 * @param {string} message - error message
 * @param {ts.DiagnosticCategory} type - error type
 * @param {boolean} tagNameShouldExisted - tag is required
 * @param {CheckValidCallbackInterface} checkValidCallback
 * @param {CheckJsDocSpecialValidCallbackInterface} checkJsDocSpecialValidCallback
 * @param {checkConditionValidCallbackInterface} checkConditionValidCallback
 * @returns  {ts.JsDocNodeCheckConfigItem}
 */
function getJsDocNodeCheckConfigItem(tagName: string[], message: string, needConditionCheck: boolean,
  type: ts.DiagnosticCategory, specifyCheckConditionFuncName: string,
  tagNameShouldExisted: boolean, checkValidCallback?: CheckValidCallbackInterface,
  checkJsDocSpecialValidCallback?: CheckJsDocSpecialValidCallbackInterface,
  checkConditionValidCallback?: checkConditionValidCallbackInterface,
  checkHvigorLoggerValidCallback?: checkHvigorLoggerValidCallbackInterface): ts.JsDocNodeCheckConfigItem {
  return {
    tagName: tagName,
    message: message,
    needConditionCheck: needConditionCheck,
    type: type,
    specifyCheckConditionFuncName: specifyCheckConditionFuncName,
    tagNameShouldExisted: tagNameShouldExisted,
    checkValidCallback: checkValidCallback,
    checkJsDocSpecialValidCallback: checkJsDocSpecialValidCallback,
    checkConditionValidCallback: checkConditionValidCallback,
    checkHvigorLoggerValidCallback: checkHvigorLoggerValidCallback
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
  initComparisonFunctions();
  if (/(?<!\.d)\.ts$/g.test(fileName) && isArkuiDependence(sourceFileName) &&
    sourceBaseName !== 'common_ts_ets_api.d.ts' && sourceBaseName !== 'global.d.ts') {
    checkConfigArray.push(getJsDocNodeCheckConfigItem([], FIND_MODULE_WARNING, false, ts.DiagnosticCategory.Warning,
      '', true));
  }
  if (!systemModules.includes(apiName) && (allModulesPaths.includes(path.normalize(sourceFileName)) ||
    isArkuiDependence(sourceFileName))) {
    permissionsArray = projectConfig.requestPermissions;
    checkConfigArray.push(getJsDocNodeCheckConfigItem([DEPRECATED_TAG_CHECK_NAME], DEPRECATED_TAG_CHECK_WARNING, false,
      ts.DiagnosticCategory.Warning, '', false));
    checkConfigArray.push(getJsDocNodeCheckConfigItem([SYSTEM_API_TAG_CHECK_NAME], SYSTEM_API_TAG_CHECK_WARNING, false,
      ts.DiagnosticCategory.Warning, '', false));
    if (sourceBaseName !== AVAILABLE_FILE_NAME) {
      checkConfigArray.push(getJsDocNodeCheckConfigItem([SINCE_TAG_NAME],
        SINCE_TAG_CHECK_ERROR, false, ts.DiagnosticCategory.Warning,
        VERSION_CHECK_FUNCTION_NAME, false, undefined, checkSinceValue));
    }
    // TODO: the third param is to be opened
    if (projectConfig.deviceTypes && projectConfig.deviceTypes.length > 0) {
      const fileContent: string = fs.readFileSync(fileName, { encoding: 'utf-8' });
      const needCanIUseCheck: boolean = /canIUse\(.*\)/.test(fileContent);
      checkConfigArray.push(getJsDocNodeCheckConfigItem([SYSCAP_TAG_CHECK_NAME],
        SYSCAP_TAG_CHECK_WARNING, needCanIUseCheck, ts.DiagnosticCategory.Warning, CANIUSE_FUNCTION_NAME, false, undefined,
        checkSyscapAbility, checkSyscapConditionValidCallback));
    }
    if (projectConfig.projectRootPath) {
      const ohosTestDir = ts.sys.resolvePath(path.join(projectConfig.projectRootPath, 'entry', 'src', 'ohosTest'));
      // TODO:fix error type in the feature
      if (!ts.sys.resolvePath(fileName).startsWith(ohosTestDir)) {
        permissionsArray = projectConfig.requestPermissions;
        checkConfigArray.push(getJsDocNodeCheckConfigItem([TEST_TAG_CHECK_NAME], TEST_TAG_CHECK_ERROR, false,
          ts.DiagnosticCategory.Warning, '', false));
      }
    }
    checkConfigArray.push(getJsDocNodeCheckConfigItem([PERMISSION_TAG_CHECK_NAME], PERMISSION_TAG_CHECK_ERROR, false,
      ts.DiagnosticCategory.Warning, '', false, undefined, checkPermissionValue));
    if (isCardFile(fileName)) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([FORM_TAG_CHECK_NAME], FORM_TAG_CHECK_ERROR, false,
        ts.DiagnosticCategory.Error, '', true, undefined, undefined, undefined, hvigorErrorLogger));
    }
    if (projectConfig.isCrossplatform) {
      needCheckResult = true;
      const logType: ts.DiagnosticCategory = projectConfig.ignoreCrossplatformCheck !== true ? ts.DiagnosticCategory.Error :
        ts.DiagnosticCategory.Warning;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([CROSSPLATFORM_TAG_CHECK_NAME], CROSSPLATFORM_TAG_CHECK_ERROER,
        false, logType, '', true, undefined, undefined, undefined, hvigorErrorLogger));
    }
    if (process.env.compileMode === STAGE_COMPILE_MODE) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([FA_TAG_CHECK_NAME, FA_TAG_HUMP_CHECK_NAME],
        FA_TAG_CHECK_ERROR, false, ts.DiagnosticCategory.Error, '', false, undefined, undefined, undefined, hvigorErrorLogger));
    } else if (process.env.compileMode !== '') {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([STAGE_TAG_CHECK_NAME, STAGE_TAG_HUMP_CHECK_NAME],
        STAGE_TAG_CHECK_ERROR, false,
        ts.DiagnosticCategory.Error, '', false, undefined, undefined, undefined, hvigorErrorLogger));
    }
    if (projectConfig.bundleType === ATOMICSERVICE_BUNDLE_TYPE &&
      projectConfig.compileSdkVersion >= ATOMICSERVICE_TAG_CHECK_VERSION) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([ATOMICSERVICE_TAG_CHECK_NAME], ATOMICSERVICE_TAG_CHECK_ERROER,
        false, ts.DiagnosticCategory.Error, '', true, undefined, undefined, undefined, hvigorErrorLogger));
    }
  } else if (!systemModules.includes(apiName) && path.normalize(sourceFileName).startsWith(projectConfig.projectRootPath)) {
    needCheckResult = true;
    checkConfigArray.push(getJsDocNodeCheckConfigItem([SINCE_TAG_NAME],
    SINCE_TAG_CHECK_ERROR, false, ts.DiagnosticCategory.Warning,
    VERSION_CHECK_FUNCTION_NAME, true, undefined, checkAvailableDecorator));
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
function getAvailableNodeKey(node: ts.Node):string {
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
  if (!projectConfig.compatibleSdkVersion || !node) {
    return false;
  }

  let key: string = getAvailableNodeKey(node);
  if (availableNodeCheckConfigCache.has(key)) {
    return false;
  } else {
    availableNodeCheckConfigCache.set(key, "");
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
    typeChecker
  );
  
  if (suppressor.isApiVersionHandled(node)) {
    return false;
  }
  
  config.message = AVAILABLE_DECORATOR_WARNING
    .replace('$SINCE1', minApiVersion.toString())  // Minimum required API version
    .replace('$SINCE2', checker.getSdkVersion());     // Current project API version
  
  return true;
}


/**
 * Validates if a since tag requires version checking based on JSDoc and project configuration.
 * 
 * @param jsDocTags - Array of JSDoc tags to analyze
 * @param config - Configuration object that will receive error messages
 * @param node - Optional TypeScript node for additional validation
 * @returns True if since check is required and validation fails, false otherwise
 */
function checkSinceValue(
  jsDocTags: readonly ts.JSDocTag[],
  config: ts.JsDocNodeCheckConfigItem,
  node?: ts.Node
): boolean {
  if (!jsDocTags[0]?.parent?.parent || !projectConfig.compatibleSdkVersion || !node) {
    return false;
  }

  const jsDocNode = jsDocTags[0].parent.parent as HasJSDocNode;
  if (!jsDocNode?.jsDoc) {
    return false;
  }

  const typeChecker = CurrentProcessFile.getChecker();

  const checker = new SinceJSDocChecker(typeChecker);
  const hasIncompatibility = checker.checkTargetVersion(jsDocNode);
  
  if (!hasIncompatibility) {
    return false;
  }

  const minApiVersion = checker.getMinApiVersion();

  // Use SinceWarningSuppressor with all three strategies
  const suppressor = new SinceWarningSuppressor(
    checker.getSdkVersion(), 
    minApiVersion, 
    typeChecker
  );

  if (suppressor.isApiVersionHandled(node)) {
    return false;
  }

  config.message = SINCE_TAG_CHECK_ERROR
    .replace('$SINCE1', minApiVersion)
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
  return /^(?!0\d)[1-9]\d{0,2}(?:\.[1-9]\d{0,2}|\.0){0,2}$/.test(since);
}

/**
 * Format checker for integer-only versions (e.g., "19", "20").
 * Used for OpenHarmony runtime where multi-segment format (MSF) is not allowed.
 * 
 * Rules:
 * - Major version only: 1-999 (no leading zero)
 * - No decimal points allowed
 * 
 * Valid examples: "19", "20", "999"
 * Invalid examples: "0", "01", "1000", "19.1"
 * 
 * @param since - Version string to validate
 * @returns true if format is valid
 */
export function defaultFormatCheckerWithoutMSF(since: string): boolean {
  return /^[1-9]\d{0,2}$/.test(since);
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
  const newFormatKey = `${osName}/${tag}/CompatibilityCheck`;
  let plugins = externalApiCheckPlugin.get(newFormatKey);
  
  if (!plugins || plugins.length === 0) {
    // Try old format: {osName}/{tag}
    const oldFormatKey = `${osName}/${tag}`;
    plugins = externalApiCheckPlugin.get(oldFormatKey);
  }
  
  // Try to load external plugin
  if (plugins && plugins.length > 0) {
    for (const plugin of plugins) {
      try {
        const externalModule = require(plugin.path);
        const externalMethod = externalModule[plugin.functionName];
        
        if (typeof externalMethod === 'function') {
          comparisonFunctions.valueChecker.set(cacheKey, externalMethod);
          return;
        }
      } catch (error) {
        // Silent fail, will use default
      }
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
  
  if (plugins && plugins.length > 0) {
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
  }
  
  // Fallback to default
  const defaultChecker = defaultFormatCheckerWithoutMSF;
  comparisonFunctions.formatChecker.set(cacheKey, defaultChecker);
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
  
  return checker || defaultFormatCheckerWithoutMSF;
}

/**
 * Determine the necessity of syscap check.
 * @param jsDocTags 
 * @param config 
 * @returns 
 */
export function checkSyscapAbility(jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem): boolean {
  let currentSyscapValue: string = '';
  for (let i = 0; i < jsDocTags.length; i++) {
    const jsDocTag: ts.JSDocTag = jsDocTags[i];
    if (jsDocTag && jsDocTag.tagName.escapedText.toString() === SYSCAP_TAG_CHECK_NAME) {
      currentSyscapValue = jsDocTag.comment as string;
      break;
    }
  }
  return projectConfig.syscapIntersectionSet && !projectConfig.syscapIntersectionSet.has(currentSyscapValue);
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
 * @returns {boolean}
 */
export function checkPermissionValue(jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem): boolean {
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
  return comment !== '' && !JsDocCheckService.validPermission(comment, permissionsArray);
}

/**
 * custom condition check
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
      const typeChecker: ts.TypeChecker = globalProgram.program.getTypeChecker();
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
  const firstParts = firstVersion.split('.');
  const secondParts = secondVersion.split('.');

  for (let i = 0; i < 3; i++) {
    const part1 = parseInt(firstParts[i] || '0', 10);
    const part2 = parseInt(secondParts[i] || '0', 10);

    if (part1 !== part2) {
      return part1 > part2 ? ComparisonResult.Greater : ComparisonResult.Less;
    }
  }

  return ComparisonResult.Equal;
}

let positionMessageInfo: string[] = [];
let errorCodeMessage: Object | undefined;
/**
 * save rollup share Object
 * @param { Object | undefined } share
 */
export function saveRollupShareObject(share: Object | undefined) {
  errorCodeMessage = share;
}

/**
 * build error diagnostic
 * @param { JsDocNodeCheckConfig } config
 * @param { DiagnosticWithLocation } diagnostic
 * @returns { BuildDiagnosticInfo }
 */
function buildErrorDiagnostic(config: ts.JsDocNodeCheckConfigItem, diagnostic: ts.DiagnosticWithLocation): BuildDiagnosticInfo {
  const { line, character }: ts.LineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
  const positionMessage: string = `File: ${diagnostic.file.fileName}:${line + 1}:${character + 1}`;
  return new BuildDiagnosticInfo()
    .setCode(Number(ERROR_CODE_INFO.get(config.message).code))
    .setDescription(ERROR_CODE_INFO.get(config.message).description)
    .setPositionMessage(positionMessage)
    .setMessage(String(diagnostic.messageText))
    .setSolutions(ERROR_CODE_INFO.get(config.message).solutions)
}

/**
 * hvigor error logger
 * @param { JsDocNodeCheckConfig } config
 * @param { DiagnosticWithLocation } diagnostic
 * @returns { void }
 */
function hvigorErrorLogger(config: ts.JsDocNodeCheckConfigItem, diagnostic: ts.DiagnosticWithLocation): void {
  const errorInfo: SdkHvigorErrorInfo = sdkTransfromErrorCode(buildErrorDiagnostic(config, diagnostic));
  if (errorCodeMessage && !(positionMessageInfo.includes(errorInfo.getPosition()))) {
    positionMessageInfo.push(errorInfo.getPosition());
    errorCodeMessage.printError(errorInfo);
  }
}

/**
 * api transfrom error code
 * @param { BuildDiagnosticInfo } diagnostic
 * @returns { SdkHvigorErrorInfo }
 */
function sdkTransfromErrorCode(diagnostic: BuildDiagnosticInfo): SdkHvigorErrorInfo {
  return new SdkHvigorErrorInfo()
    .setCode(String(diagnostic.getCode()))
    .setDescription(diagnostic.description)
    .setCause(diagnostic.getMessage())
    .setPosition(diagnostic.getPositionMessage())
    .setSolutions(diagnostic.getSolutions());
}

/**
 * reset api_check_utils global object
 */
export function resetApiCheckUtils() {
  positionMessageInfo = [];
  errorCodeMessage = undefined;
}

export function getAvailableDecoratorFromDeclaration(decl: ts.Node): ts.Decorator[] {
  const declarationText = decl.getText();
  const regex = /@\s*Available\s*\(\s*\{\s*minApiVersion\s*:\s*(['"])[^'"]*\1\s*\}\s*\)/;
  const decorator = declarationText.match(regex);
  if (!decorator){
    return [];
  }

  decorator[0] = decorator[0].replace('@', '');

  const decorators: ts.Decorator[] = [];

  // Create temp source code
  const tempSource = ts.createSourceFile(
    "temp.ts",
    `${decorator[0]}`,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  let callExpr: ts.CallExpression | null = null;
  ts.forEachChild(tempSource, (stmt) => {
    if (
      ts.isExpressionStatement(stmt) &&
      ts.isCallExpression(stmt.expression)
    ) {
      callExpr = stmt.expression;
    }
  });

  if (callExpr) {
    decorators.push(ts.factory.createDecorator(callExpr));
  }

  return decorators;
}