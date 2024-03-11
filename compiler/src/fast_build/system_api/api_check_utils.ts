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
  ATOMICSERVICE_TAG_CHECK_VERSION,
  SINCE_TAG_NAME,
  CONSTANT_STEP_0,
  CONSTANT_STEP_1,
  CONSTANT_STEP_2,
  CONSTANT_STEP_3,
  CONSTANT_STEP_4,
  CONSTANT_VERSION_10
} from '../../pre_define';


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
  const versionSteps: string[] = bundleVersion.split(/[\.\(\)]/g);
  // eg: since xx
  if (versionSteps.length === CONSTANT_STEP_1 && !isNaN(Number(versionSteps[CONSTANT_STEP_0])) &&
    Number(versionSteps[CONSTANT_STEP_0]) > CONSTANT_VERSION_10) {
    return true;
    // eg: since x.x.x(xx)
  } else if (versionSteps.length >= CONSTANT_STEP_3 && !isNaN(Number(versionSteps[CONSTANT_STEP_0])) &&
    !isNaN(Number(versionSteps[CONSTANT_STEP_1]))) {
    const firstStep: number = Number(versionSteps[CONSTANT_STEP_0]);
    const secondStep: number = Number(versionSteps[CONSTANT_STEP_1]);
    if (firstStep > CONSTANT_STEP_4 || firstStep === CONSTANT_STEP_4 && secondStep >= CONSTANT_STEP_1) {
      return true;
    }
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
  for (let config of extendSdkConfigs.values()) {
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
    let sourceFile: ts.SourceFile | undefined = undefined;
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
 * @param {CheckValidCallbackInterface} [checkValidCallback]
 * @param {CheckJsDocSpecialValidCallbackInterface} [checkJsDocSpecialValidCallback]
 * @returns  {ts.JsDocNodeCheckConfigItem}
 */
function getJsDocNodeCheckConfigItem(tagName: string[], message: string, type: ts.DiagnosticCategory,
  tagNameShouldExisted: boolean, checkValidCallback?: CheckValidCallbackInterface,
  checkJsDocSpecialValidCallback?: CheckJsDocSpecialValidCallbackInterface): ts.JsDocNodeCheckConfigItem {
  return {
    tagName: tagName,
    message: message,
    needConditionCheck: false,
    type: type,
    specifyCheckConditionFuncName: '',
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
/**
 * get tagName where need to be determined based on the file path
 *
 * @param {string} fileName - file name
 * @param {string} sourceFileName - resource reference path
 * @returns {ts.JsDocNodeCheckConfig}
 */
export function getJsDocNodeCheckConfig(fileName: string, sourceFileName: string): ts.JsDocNodeCheckConfig {
  let byFileName = jsDocNodeCheckConfigCache.get(fileName);
  if (byFileName === undefined) {
    byFileName = new Map<string, ts.JsDocNodeCheckConfig>();
    jsDocNodeCheckConfigCache.set(fileName, byFileName)
  }
  let result = byFileName.get(sourceFileName);
  if (result !== undefined) {
    return result
  }
  let needCheckResult: boolean = false;
  const checkConfigArray: ts.JsDocNodeCheckConfigItem[] = [];
  const apiName: string = path.basename(fileName);
  const sourceBaseName: string = path.basename(sourceFileName);
  if (/(?<!\.d)\.ts$/g.test(fileName) && isArkuiDependence(sourceFileName) &&
    sourceBaseName !== 'common_ts_ets_api.d.ts' && sourceBaseName !== 'global.d.ts') {
    checkConfigArray.push(getJsDocNodeCheckConfigItem([], FIND_MODULE_WARNING, ts.DiagnosticCategory.Warning, true));
  }
  if (!systemModules.includes(apiName) && (allModulesPaths.includes(path.normalize(sourceFileName)) ||
    isArkuiDependence(sourceFileName))) {
    checkConfigArray.push(getJsDocNodeCheckConfigItem([DEPRECATED_TAG_CHECK_NAME], DEPRECATED_TAG_CHECK_WARNING,
      ts.DiagnosticCategory.Warning, false));
    if (isCardFile(fileName)) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([FORM_TAG_CHECK_NAME], FORM_TAG_CHECK_ERROR,
        ts.DiagnosticCategory.Error, true));
    }
    if (projectConfig.isCrossplatform) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([CROSSPLATFORM_TAG_CHECK_NAME], CROSSPLATFORM_TAG_CHECK_ERROER,
        ts.DiagnosticCategory.Error, true));
    }
    if (process.env.compileMode === STAGE_COMPILE_MODE) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([FA_TAG_CHECK_NAME, FA_TAG_HUMP_CHECK_NAME],
        FA_TAG_CHECK_ERROR, ts.DiagnosticCategory.Warning, false));
    } else if (process.env.compileMode !== '') {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([STAGE_TAG_CHECK_NAME, STAGE_TAG_HUMP_CHECK_NAME],
        STAGE_TAG_CHECK_ERROR,
        ts.DiagnosticCategory.Warning, false));
    }
    if (projectConfig.bundleType === ATOMICSERVICE_BUNDLE_TYPE &&
      projectConfig.compileSdkVersion >= ATOMICSERVICE_TAG_CHECK_VERSION) {
      needCheckResult = true;
      checkConfigArray.push(getJsDocNodeCheckConfigItem([ATOMICSERVICE_TAG_CHECK_NAME], ATOMICSERVICE_TAG_CHECK_ERROER,
        ts.DiagnosticCategory.Error, true));
    }
  }
  result = {
    nodeNeedCheck: needCheckResult,
    checkConfig: checkConfigArray
  };
  byFileName.set(sourceFileName, result)
  return result;
}

/**
 * return a file path is Arkui path
 *
 * @param {string} file - file path
 * @returns {boolean}
 */
function isArkuiDependence(file: string): boolean {
  const fileDir: string = path.dirname(file);
  const declarationsPath: string = path.resolve(__dirname, '../declarations').replace(/\\/g, '/');
  const componentPath: string = path.resolve(__dirname, '../../../component').replace(/\\/g, '/');
  if (fileDir === declarationsPath || fileDir === componentPath) {
    return true;
  }
  return false;
}

/**
 * check a secondary directory of Arkui is used in the moduleSpecifier of import
 *
 * @param {ts.Expression} moduleSpecifier - the moduleSpecifier of import
 * @param {LogInfo[]} log - log list
 * @returns {void}
 */
export function validateModuleSpecifier(moduleSpecifier: ts.Expression, log: LogInfo[]): void {
  const moduleSpecifierStr: string = moduleSpecifier.getText().replace(/'|"/g, '');
  const hasSubDirPath: boolean = ohosSystemModuleSubDirPaths.some((filePath: string) => {
    return filePath === moduleSpecifierStr;
  });
  if (hasSubDirPath) {
    const error: LogInfo = {
      type: LogType.WARN,
      message: `Cannot find module '${moduleSpecifierStr}' or its corresponding type declarations.`,
      pos: moduleSpecifier.getStart()
    };
    log.push(error);
  }
}
