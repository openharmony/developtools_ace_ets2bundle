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
  ohosSystemModuleSubDirPaths
} from '../../../main';
import {
  LogType,
  LogInfo,
  FileLog
} from '../../utils';
import { type ResolveModuleInfo } from '../../ets_checker';
import {
  GLOBAL_DECLARE_WHITE_LIST,
  FIND_MODULE_WARNING,
  FORM_TAG_CHECK_NAME,
  FORM_TAG_CHECK_ERROR,
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
  ATOMICSERVICE_TAG_CHECK_VERSION
} from '../../pre_define';
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
  RUNTIME_OS_OH,
  CONSTANT_STEP_0,
  CONSTANT_STEP_1,
  CONSTANT_STEP_2,
  CONSTANT_STEP_3
} from './api_check_define';
import { JsDocCheckService } from './api_check_permission';

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
  (jsDocTags: readonly ts.JSDocTag[], config: ts.JsDocNodeCheckConfigItem): boolean;
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
 * @param {FileLog} transformLog - log info
 */
export function checkTypeReference(node: ts.TypeReferenceNode, transformLog: FileLog): void {
  const fileName: string = transformLog.sourceFile.fileName;
  const currentTypeName: string = node.getText();
  if (/(?<!\.d)\.ts$/g.test(fileName)) {
    const checker: ts.TypeChecker = globalProgram.checker;
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
      sourceBaseName !== 'global.d.ts' ||
      GLOBAL_DECLARE_WHITE_LIST.has(currentTypeName) &&
      ohosSystemModulePaths.includes(sourceFile.fileName.replace(/\//g, '\\'))) {
      transformLog.errors.push({
        type: LogType.ERROR,
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
 * @param {CheckValidCallbackInterface} [checkValidCallback]
 * @param {CheckJsDocSpecialValidCallbackInterface} [checkJsDocSpecialValidCallback]
 * @returns  {ts.JsDocNodeCheckConfigItem}
 */
function getJsDocNodeCheckConfigItem(tagName: string[], message: string, needConditionCheck: boolean,
  type: ts.DiagnosticCategory, specifyCheckConditionFuncName: string,
  tagNameShouldExisted: boolean, checkValidCallback?: CheckValidCallbackInterface,
  checkJsDocSpecialValidCallback?: CheckJsDocSpecialValidCallbackInterface): ts.JsDocNodeCheckConfigItem {
  return {
    tagName: tagName,
    message: message,
    needConditionCheck: needConditionCheck,
    type: type,
    specifyCheckConditionFuncName: specifyCheckConditionFuncName,
    tagNameShouldExisted: tagNameShouldExisted,
    checkValidCallback: checkValidCallback,
    checkJsDocSpecialValidCallback: checkJsDocSpecialValidCallback
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
    // TODO: the third param is to be opened
    checkConfigArray.push(getJsDocNodeCheckConfigItem([SYSCAP_TAG_CHECK_NAME], '', false, ts.DiagnosticCategory.Warning,
      CANIUSE_FUNCTION_NAME, false, undefined, checkSyscapAbility));
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
        ts.DiagnosticCategory.Error, '', true));
    }
    if (projectConfig.isCrossplatform) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([CROSSPLATFORM_TAG_CHECK_NAME], CROSSPLATFORM_TAG_CHECK_ERROER,
        false, ts.DiagnosticCategory.Error, '', true));
    }
    if (process.env.compileMode === STAGE_COMPILE_MODE) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([FA_TAG_CHECK_NAME, FA_TAG_HUMP_CHECK_NAME],
        FA_TAG_CHECK_ERROR, false, ts.DiagnosticCategory.Error, '', false));
    } else if (process.env.compileMode !== '') {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([STAGE_TAG_CHECK_NAME, STAGE_TAG_HUMP_CHECK_NAME],
        STAGE_TAG_CHECK_ERROR, false,
        ts.DiagnosticCategory.Error, '', false));
    }
    if (projectConfig.bundleType === ATOMICSERVICE_BUNDLE_TYPE &&
      projectConfig.compileSdkVersion >= ATOMICSERVICE_TAG_CHECK_VERSION) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([ATOMICSERVICE_TAG_CHECK_NAME], ATOMICSERVICE_TAG_CHECK_ERROER,
        false, ts.DiagnosticCategory.Error, '', true));
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
    const error: LogInfo = {
      type: LogType.ERROR,
      message: `Cannot find module '${moduleSpecifierStr}' or its corresponding type declarations.`,
      pos: moduleSpecifier.getStart()
    };
    log.push(error);
  }
}

/**
 * configure syscapInfo to this.share.projectConfig
 *
 * @param config this.share.projectConfig
 */
export function configureSyscapInfo(config: any): void {
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
    return arrs.reduce(function(prev: string[], cur: string[]) {
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
    const content: object = JSON.parse(fs.readFileSync(syscapFilePath, 'utf-8'));
    if (deviceInfoMap.get(deviceType)) {
      deviceInfoMap.set(deviceType, deviceInfoMap.get(deviceType).concat(content['SysCaps']));
    } else {
      deviceInfoMap.set(deviceType, content['SysCaps']);
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
            const content: object = JSON.parse(fs.readFileSync(syscapFilePath, 'utf-8'));
            if (deviceInfoMap.get(deviceType)) {
              deviceInfoMap.set(deviceType, deviceInfoMap.get(deviceType).concat(content['SysCaps']));
            } else {
              deviceInfoMap.set(deviceType, content['SysCaps']);
            }
          }
        }
      });
    });
  });
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

interface configPermission {
  requestPermissions: Array<{ name: any, [key: string]: any }>;
  definePermissions: Array<{ name: any, [key: string]: any }>;
}
/**
 * configure permissionInfo to this.share.projectConfig
 *
 * @param config this.share.projectConfig
 */
export function configurePermission(config: any): void {
  const permission: configPermission = config.permission;
  config.requestPermissions = [];
  config.definePermissions = [];
  if (permission.requestPermissions) {
    config.requestPermissions = getNameFromArray(permission.requestPermissions);
  }
  if (permission.definePermissions) {
    config.definePermissions = getNameFromArray(permission.definePermissions);
  }
}

function getNameFromArray(array: Array<{ name: any, [key: string]: any }>): string[] {
  return array.map((item: { name: any }) => {
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
  config.message = config.message.replace('$DT', comment);
  return comment !== '' && !JsDocCheckService.validPermission(comment, permissionsArray);
}

/**
 * custom condition check
 * @param { ts.FileCheckModuleInfo } jsDocFileCheckedInfo
 * @param { ts.JsDocTagInfo[] } jsDocs
 * @returns
 */
export function getJsDocNodeConditionCheckResult(jsDocFileCheckedInfo: ts.FileCheckModuleInfo, jsDocs: ts.JsDocTagInfo[]):
  ts.ConditionCheckResult {
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
