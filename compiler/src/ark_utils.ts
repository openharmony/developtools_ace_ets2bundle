/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import path from 'path';
import fs from 'fs';
import { minify, MinifyOutput } from 'terser';

import { OH_MODULES } from './fast_build/ark_compiler/common/ark_define';
import {
  PACKAGES,
  TEMPORARY,
  ZERO,
  ONE,
  EXTNAME_JS,
  EXTNAME_TS,
  EXTNAME_MJS,
  EXTNAME_CJS,
  EXTNAME_ABC,
  EXTNAME_ETS,
  EXTNAME_TS_MAP,
  EXTNAME_JS_MAP,
  ESMODULE,
  FAIL,
  TS2ABC,
  ES2ABC,
  EXTNAME_PROTO_BIN,
  NATIVE_MODULE,
} from './pre_define';
import {
  isMac,
  isWindows,
  isPackageModulesFile,
  genTemporaryPath,
  getExtensionIfUnfullySpecifiedFilepath,
  mkdirsSync,
  toUnixPath,
  validateFilePathLength
} from './utils';
import {
  projectConfig
} from '../main';

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

export const SRC_MAIN: string = 'src/main';

export var newSourceMaps: Object = {};
export const packageCollection: Map<string, Array<string>> = new Map();

export function getOhmUrlByFilepath(filePath: string, projectConfig: any, logger: any, namespace?: string): string {
  // remove '\x00' from the rollup virtual commonjs file's filePath
  if (filePath.startsWith('\x00')) {
    filePath = filePath.replace('\x00', '');
  }
  let unixFilePath: string = toUnixPath(filePath);
  unixFilePath = unixFilePath.substring(0, filePath.lastIndexOf('.')); // remove extension
  const REG_PROJECT_SRC: RegExp = /(\S+)\/src\/(?:main|ohosTest)\/(ets|js)\/(\S+)/;

  const packageInfo: string[] = getPackageInfo(projectConfig.aceModuleJsonPath);
  const bundleName: string = packageInfo[0];
  const moduleName: string = packageInfo[1];
  const moduleRootPath: string = toUnixPath(projectConfig.modulePathMap[moduleName]);
  const projectRootPath: string = toUnixPath(projectConfig.projectRootPath);
  // case1: /entry/src/main/ets/xxx/yyy     ---> @bundle:<bundleName>/entry/ets/xxx/yyy
  // case2: /entry/src/ohosTest/ets/xxx/yyy ---> @bundle:<bundleName>/entry_test@entry/ets/xxx/yyy
  // case3: /node_modules/xxx/yyy           ---> @package:pkg_modules/xxx/yyy
  // case4: /entry/node_modules/xxx/yyy     ---> @package:pkg_modules@entry/xxx/yyy
  // case5: /library/node_modules/xxx/yyy   ---> @package:pkg_modules@library/xxx/yyy
  // case6: /library/index.ts               ---> @bundle:<bundleName>/library/index
  const projectFilePath: string = unixFilePath.replace(projectRootPath, '');
  const packageDir: string = projectConfig.packageDir;
  const result: RegExpMatchArray | null = projectFilePath.match(REG_PROJECT_SRC);
  if (result && result[1].indexOf(packageDir) === -1) {
    let langType: string = result[2];
    let relativePath: string = result[3];
    // case7: /entry/src/main/ets/xxx/src/main/js/yyy ---> @bundle:<bundleName>/entry/ets/xxx/src/main/js/yyy
    const REG_SRC_MAIN: RegExp = /src\/(?:main|ohosTest)\/(ets|js)\//;
    const srcMainIndex: number = result[1].search(REG_SRC_MAIN);
    if (srcMainIndex !== -1) {
      relativePath = projectFilePath.substring(srcMainIndex).replace(REG_SRC_MAIN, '');
      langType = projectFilePath.replace(relativePath, '').match(REG_SRC_MAIN)[1];
    }
    if (namespace && moduleName !== namespace) {
      return `${bundleName}/${moduleName}@${namespace}/${langType}/${relativePath}`;
    }
    return `${bundleName}/${moduleName}/${langType}/${relativePath}`;
  }

  if (projectFilePath.indexOf(packageDir) !== -1) {
    if (process.env.compileTool === 'rollup') {
      const tryProjectPkg: string = toUnixPath(path.join(projectRootPath, packageDir));
      if (unixFilePath.indexOf(tryProjectPkg) !== -1) {
        return unixFilePath.replace(tryProjectPkg, `${packageDir}`).replace(new RegExp(packageDir, 'g'), PACKAGES);
      }
      // iterate the modulePathMap to find the moudleName which contains the pkg_module's file
      for (const moduleName in projectConfig.modulePathMap) {
        const modulePath: string = projectConfig.modulePathMap[moduleName];
        const tryModulePkg: string = toUnixPath(path.resolve(modulePath, packageDir));
        if (unixFilePath.indexOf(tryModulePkg) !== -1) {
          return unixFilePath.replace(tryModulePkg, `${packageDir}@${moduleName}`).replace(
            new RegExp(packageDir, 'g'), PACKAGES);
        }
      }

      logger.error(red, `ArkTS:ERROR Failed to get an resolved OhmUrl by filepath "${filePath}"`, reset);
      return filePath;
    }

    // webpack with old implematation
    const tryProjectPkg: string = toUnixPath(path.join(projectRootPath, packageDir));
    if (unixFilePath.indexOf(tryProjectPkg) !== -1) {
      return unixFilePath.replace(tryProjectPkg, `${packageDir}/${ONE}`).replace(new RegExp(packageDir, 'g'), PACKAGES);
    }

    const tryModulePkg: string = toUnixPath(path.join(moduleRootPath, packageDir));
    if (unixFilePath.indexOf(tryModulePkg) !== -1) {
      return unixFilePath.replace(tryModulePkg, `${packageDir}/${ZERO}`).replace(new RegExp(packageDir, 'g'), PACKAGES);
    }
  }

  for (const key in projectConfig.modulePathMap) {
    const moduleRootPath: string = toUnixPath(projectConfig.modulePathMap[key]);
    if (unixFilePath.indexOf(moduleRootPath + '/') !== -1) {
      const relativeModulePath: string = unixFilePath.replace(moduleRootPath + '/', '');
      if (namespace && moduleName !== namespace) {
        return `${bundleName}/${moduleName}@${namespace}/${relativeModulePath}`;
      }
      return `${bundleName}/${moduleName}/${relativeModulePath}`;
    }
  }

  logger.error(red, `ArkTS:ERROR Failed to get an resolved OhmUrl by filepath "${filePath}"`, reset);
  return filePath;
}

export function getOhmUrlBySystemApiOrLibRequest(moduleRequest: string) : string
{
  const REG_SYSTEM_MODULE: RegExp = /@(system|ohos)\.(\S+)/;
  const REG_LIB_SO: RegExp = /lib(\S+)\.so/;

  if (REG_SYSTEM_MODULE.test(moduleRequest.trim())) {
    return moduleRequest.replace(REG_SYSTEM_MODULE, (_, moduleType, systemKey) => {
      const systemModule: string = `${moduleType}.${systemKey}`;
      if (NATIVE_MODULE.has(systemModule)) {
        return `@native:${systemModule}`;
      } else {
        return `@ohos:${systemKey}`;
      };
    });
  }
  if (REG_LIB_SO.test(moduleRequest.trim())) {
    return moduleRequest.replace(REG_LIB_SO, (_, libsoKey) => {
      return `@app:${projectConfig.bundleName}/${projectConfig.moduleName}/${libsoKey}`;
    });
  }

  return undefined;
}

export function genSourceMapFileName(temporaryFile: string): string {
  let abcFile: string = temporaryFile;
  if (temporaryFile.endsWith(EXTNAME_TS)) {
    abcFile = temporaryFile.replace(/\.ts$/, EXTNAME_TS_MAP);
  } else {
    abcFile = temporaryFile.replace(/\.js$/, EXTNAME_JS_MAP);
  }
  return abcFile;
}

export function getBuildModeInLowerCase(projectConfig: any): string {
  return (process.env.compileTool === 'rollup' ?  projectConfig.buildMode : projectConfig.buildArkMode).toLowerCase();
}

export function writeFileSyncByString(sourcePath: string, sourceCode: string, projectConfig: any, logger: any): void {
  const filePath: string = genTemporaryPath(sourcePath, projectConfig.projectPath, process.env.cachePath, projectConfig);
  if (filePath.length === 0) {
    return;
  }
  mkdirsSync(path.dirname(filePath));
  if (/\.js$/.test(sourcePath)) {
    sourceCode = transformModuleSpecifier(sourcePath, sourceCode, projectConfig);
    if (projectConfig.buildArkMode === 'debug') {
      fs.writeFileSync(filePath, sourceCode);
      return;
    }
    writeMinimizedSourceCode(sourceCode, filePath, logger);
  }
  if (/\.json$/.test(sourcePath)) {
    fs.writeFileSync(filePath, sourceCode);
  }
}

export function transformModuleSpecifier(sourcePath: string, sourceCode: string, projectConfig: any): string {
  // replace relative moduleSpecifier with ohmURl
  const REG_RELATIVE_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]((?:\.\/|\.\.\/)[^'"]+|(?:\.\/?|\.\.\/?))['"]/g;
  const REG_HAR_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^\.\/][^'"]+)['"]/g;
  // replace requireNapi and requireNativeModule with import
  const REG_REQUIRE_NATIVE_MODULE: RegExp = /var (\S+) = globalThis.requireNativeModule\(['"](\S+)['"]\);/g;
  const REG_REQUIRE_NAPI_APP: RegExp = /var (\S+) = globalThis.requireNapi\(['"](\S+)['"], true, ['"](\S+)['"]\);/g;
  const REG_REQUIRE_NAPI_OHOS: RegExp = /var (\S+) = globalThis.requireNapi\(['"](\S+)['"]\);/g;

  return sourceCode.replace(REG_HAR_DEPENDENCY, (item, moduleRequest) => {
    return replaceHarDependency(item, moduleRequest, projectConfig);
  }).replace(REG_RELATIVE_DEPENDENCY, (item, moduleRequest) => {
    return replaceRelativeDependency(item, moduleRequest, toUnixPath(sourcePath), projectConfig);
  }).replace(REG_REQUIRE_NATIVE_MODULE, (_, moduleRequest, moduleName) => {
    return `import ${moduleRequest} from '@native:${moduleName}';`;
  }).replace(REG_REQUIRE_NAPI_APP, (_, moduleRequest, soName, moudlePath) => {
    return `import ${moduleRequest} from '@app:${moudlePath}/${soName}';`;
  }).replace(REG_REQUIRE_NAPI_OHOS, (_, moduleRequest, moduleName) => {
    return `import ${moduleRequest} from '@ohos:${moduleName}';`;
  });
}

export function getOhmUrlByHarName(moduleRequest: string, projectConfig: any): string | undefined {
  if (projectConfig.harNameOhmMap) {
    // case1: "@ohos/lib" ---> "@bundle:bundleName/lib/ets/index"
    if (projectConfig.harNameOhmMap.hasOwnProperty(moduleRequest)) {
      return projectConfig.harNameOhmMap[moduleRequest];
    }
    // case2: "@ohos/lib/src/main/ets/pages/page1" ---> "@bundle:bundleName/lib/ets/pages/page1"
    for (const harName in projectConfig.harNameOhmMap) {
      if (moduleRequest.startsWith(harName + '/')) {
        const idx: number = projectConfig.harNameOhmMap[harName].split('/', 2).join('/').length;
        const harOhmName: string = projectConfig.harNameOhmMap[harName].substring(0, idx);
        if (moduleRequest.indexOf(harName + '/' + SRC_MAIN) === 0) {
          return moduleRequest.replace(harName + '/' + SRC_MAIN, harOhmName);
        } else {
          return moduleRequest.replace(harName, harOhmName);
        }
      }
    }
  }
  return undefined;
}

function replaceHarDependency(item:string, moduleRequest: string, projectConfig: any): string {
  const harOhmUrl: string | undefined = getOhmUrlByHarName(moduleRequest, projectConfig);
  if (harOhmUrl !== undefined) {
    return item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
      return quotation + harOhmUrl + quotation;
    });
  }
  return item;
}

function locateActualFilePathWithModuleRequest(absolutePath: string): string {
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory()) {
    return absolutePath
  }

  const filePath: string = absolutePath + getExtensionIfUnfullySpecifiedFilepath(absolutePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return absolutePath;
  }

  return path.join(absolutePath, 'index');
}

function replaceRelativeDependency(item:string, moduleRequest: string, sourcePath: string, projectConfig: any): string {
  if (sourcePath && projectConfig.compileMode === ESMODULE) {
    // remove file extension from moduleRequest
    const SUFFIX_REG: RegExp = /\.(?:[cm]?js|[e]?ts|json)$/;
    moduleRequest = moduleRequest.replace(SUFFIX_REG, '');

    // normalize the moduleRequest
    item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
      let normalizedModuleRequest: string = toUnixPath(path.normalize(moduleRequest));
      if (moduleRequest.startsWith("./")) {
        normalizedModuleRequest = "./" + normalizedModuleRequest;
      }
      return quotation + normalizedModuleRequest + quotation;
    });

    const filePath: string =
      locateActualFilePathWithModuleRequest(path.resolve(path.dirname(sourcePath), moduleRequest));
    const result: RegExpMatchArray | null =
      filePath.match(/(\S+)(\/|\\)src(\/|\\)(?:main|ohosTest)(\/|\\)(ets|js)(\/|\\)(\S+)/);
    if (result && projectConfig.aceModuleJsonPath) {
      const npmModuleIdx: number = result[1].search(/(\/|\\)node_modules(\/|\\)/);
      const projectRootPath: string = projectConfig.projectRootPath;
      if (npmModuleIdx === -1 || npmModuleIdx === projectRootPath.search(/(\/|\\)node_modules(\/|\\)/)) {
        const packageInfo: string[] = getPackageInfo(projectConfig.aceModuleJsonPath);
        const bundleName: string = packageInfo[0];
        const moduleName: string = packageInfo[1];
        moduleRequest = `@bundle:${bundleName}/${moduleName}/${result[5]}/${toUnixPath(result[7])}`;
        item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
          return quotation + moduleRequest + quotation;
        });
      }
    }
  }
  return item;
}

export async function writeMinimizedSourceCode(content: string, filePath: string, logger: any,
  isHar: boolean = false, relativeSourceFilePath: string = '', rollupNewSourceMaps: any = {}): Promise<void> {
  let result: MinifyOutput;
  try {
    const minifyOptions = {
      compress: {
        join_vars: false,
        sequences: 0,
        directives: false
      }
    };
    if (!isHar) {
      minifyOptions['format'] = {
        semicolons: false,
        beautify: true,
        indent_level: 2
      };
      if (process.env.compileTool === 'rollup' && relativeSourceFilePath.length > 0) {
        minifyOptions['sourceMap'] = {
          content: rollupNewSourceMaps[relativeSourceFilePath],
          asObject: true
        };
      }
    }
    result = await minify(content, minifyOptions);
  } catch {
    logger.error(red, `ArkTS:ERROR Failed to source code obfuscation.`, reset);
    process.exit(FAIL);
  }
  if (process.env.compileTool === 'rollup' && result.map) {
    result.map.sourcesContent && delete result.map.sourcesContent;
    result.map.sources = [relativeSourceFilePath];
    rollupNewSourceMaps[relativeSourceFilePath] = result.map;
  }
  fs.writeFileSync(filePath, result.code);
}

export function genBuildPath(filePath: string, projectPath: string, buildPath: string, projectConfig: any): string {
  filePath = toUnixPath(filePath);
  if (filePath.endsWith(EXTNAME_MJS)) {
    filePath = filePath.replace(/\.mjs$/, EXTNAME_JS);
  }
  if (filePath.endsWith(EXTNAME_CJS)) {
    filePath = filePath.replace(/\.cjs$/, EXTNAME_JS);
  }
  projectPath = toUnixPath(projectPath);

  if (isPackageModulesFile(filePath, projectConfig)) {
    const packageDir: string = projectConfig.packageDir;
    const fakePkgModulesPath: string = toUnixPath(path.join(projectConfig.projectRootPath, packageDir));
    let output: string = '';
    if (filePath.indexOf(fakePkgModulesPath) === -1) {
      const hapPath: string = toUnixPath(projectConfig.projectRootPath);
      const tempFilePath: string = filePath.replace(hapPath, '');
      const sufStr: string = tempFilePath.substring(tempFilePath.indexOf(packageDir) + packageDir.length + 1);
      output = path.join(projectConfig.nodeModulesPath, ZERO, sufStr);
    } else {
      output = filePath.replace(fakePkgModulesPath, path.join(projectConfig.nodeModulesPath, ONE));
    }
    return output;
  }

  if (filePath.indexOf(projectPath) !== -1) {
    const sufStr: string = filePath.replace(projectPath, '');
    const output: string = path.join(buildPath, sufStr);
    return output;
  }

  return '';
}

export function getPackageInfo(configFile: string): Array<string> {
  if (packageCollection.has(configFile)) {
    return packageCollection.get(configFile);
  }
  const data: any = JSON.parse(fs.readFileSync(configFile).toString());
  const bundleName: string = data.app.bundleName;
  const moduleName: string = data.module.name;
  packageCollection.set(configFile, [bundleName, moduleName]);
  return [bundleName, moduleName];
}

export function generateSourceFilesToTemporary(sourcePath: string, sourceContent: string, sourceMap: any,
  projectConfig: any, logger: any): void {
  let jsFilePath: string = genTemporaryPath(sourcePath, projectConfig.projectPath, process.env.cachePath, projectConfig);
  if (jsFilePath.length === 0) {
    return;
  }
  if (jsFilePath.endsWith(EXTNAME_ETS)) {
    jsFilePath = jsFilePath.replace(/\.ets$/, EXTNAME_JS);
  } else {
    jsFilePath = jsFilePath.replace(/\.ts$/, EXTNAME_JS);
  }
  let sourceMapFile: string = genSourceMapFileName(jsFilePath);
  if (sourceMapFile.length > 0 && projectConfig.buildArkMode === 'debug') {
    let source = toUnixPath(sourcePath).replace(toUnixPath(projectConfig.projectRootPath) + '/', '');
    // adjust sourceMap info
    sourceMap.sources = [source];
    sourceMap.file = path.basename(sourceMap.file);
    delete sourceMap.sourcesContent;
    newSourceMaps[source] = sourceMap;
  }
  sourceContent = transformModuleSpecifier(sourcePath, sourceContent, projectConfig);

  mkdirsSync(path.dirname(jsFilePath));
  if (projectConfig.buildArkMode === 'debug') {
    fs.writeFileSync(jsFilePath, sourceContent);
    return;
  }

  writeMinimizedSourceCode(sourceContent, jsFilePath, logger);
}

export function genAbcFileName(temporaryFile: string): string {
  let abcFile: string = temporaryFile;
  if (temporaryFile.endsWith(EXTNAME_TS)) {
    abcFile = temporaryFile.replace(/\.ts$/, EXTNAME_ABC);
  } else {
    abcFile = temporaryFile.replace(/\.js$/, EXTNAME_ABC);
  }
  return abcFile;
}

export function isOhModules(projectConfig: any): boolean {
  return projectConfig.packageDir === OH_MODULES;
}

export function isEs2Abc(projectConfig: any): boolean {
  return projectConfig.pandaMode === ES2ABC || projectConfig.pandaMode === "undefined" ||
    projectConfig.pandaMode === undefined;
}

export function isTs2Abc(projectConfig: any): boolean {
  return projectConfig.pandaMode === TS2ABC;
}

export function genProtoFileName(temporaryFile: string): string {
  return temporaryFile.replace(/\.(?:[tj]s|json)$/, EXTNAME_PROTO_BIN);
}

export function genMergeProtoFileName(temporaryFile: string): string {
  let protoTempPathArr: string[] = temporaryFile.split(TEMPORARY);
  const sufStr: string = protoTempPathArr[protoTempPathArr.length - 1];
  let protoBuildPath: string = path.join(process.env.cachePath, "protos", sufStr);

  return protoBuildPath;
}

export function removeDuplicateInfo(moduleInfos: Array<any>): Array<any> {
  const tempModuleInfos: any[] = Array<any>();
  moduleInfos.forEach((item) => {
    let check: boolean = tempModuleInfos.every((newItem) => {
      return item.tempFilePath !== newItem.tempFilePath;
    });
    if (check) {
      tempModuleInfos.push(item);
    }
  });
  moduleInfos = tempModuleInfos;

  return moduleInfos;
}

export function buildCachePath(tailName: string, projectConfig: any, logger: any): string {
  let pathName: string = process.env.cachePath !== undefined ?
      path.join(projectConfig.cachePath, tailName) : path.join(projectConfig.aceModuleBuild, tailName);
  validateFilePathLength(pathName, logger);
  return pathName;
}

export function getArkBuildDir(arkDir: string): string {
  if (isWindows()) {
    return path.join(arkDir, 'build-win');
  } else if (isMac()) {
    return path.join(arkDir, 'build-mac');
  } else {
    return path.join(arkDir, 'build');
  }
}

export function getBuildBinDir(arkDir: string): string {
  return path.join(getArkBuildDir(arkDir), 'bin');
}
