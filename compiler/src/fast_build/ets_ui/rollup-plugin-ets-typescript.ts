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

import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import { createFilter } from '@rollup/pluginutils';
import MagicString from 'magic-string';

import {
  LogInfo,
  componentInfo,
  emitLogInfo,
  getTransformLog,
  genTemporaryPath,
  writeFileSync,
  getAllComponentsOrModules,
  writeCollectionFile,
  storedFileInfo,
  fileInfo,
  resourcesRawfile,
  differenceResourcesRawfile,
  CacheFile,
  startTimeStatisticsLocation,
  stopTimeStatisticsLocation,
  CompilationTimeStatistics,
  genLoaderOutPathOfHar,
  harFilesRecord,
  resetUtils,
  getResolveModules
} from '../../utils';
import {
  preprocessExtend,
  preprocessNewExtend,
  validateUISyntax,
  propertyCollection,
  linkCollection,
  resetComponentCollection,
  componentCollection,
  resetValidateUiSyntax
} from '../../validate_ui_syntax';
import {
  processUISyntax,
  resetLog,
  transformLog,
  resetProcessUiSyntax
} from '../../process_ui_syntax';
import {
  projectConfig,
  abilityPagesFullPath,
  globalProgram,
  resetMain,
  globalModulePaths
} from '../../../main';
import {
  appComponentCollection,
  compilerOptions as etsCheckerCompilerOptions,
  resolveModuleNames,
  resolveTypeReferenceDirectives,
  resetEtsCheck,
  collectAllFiles,
  allSourceFilePaths
} from '../../ets_checker';
import {
  CUSTOM_BUILDER_METHOD,
  GLOBAL_CUSTOM_BUILDER_METHOD,
  INNER_CUSTOM_BUILDER_METHOD,
  resetComponentMap
} from '../../component_map';
import {
  kitTransformLog,
  processKitImport
} from '../../process_kit_import';
import { resetProcessComponentMember } from '../../process_component_member';
import { mangleFilePath } from '../ark_compiler/common/ob_config_resolver';

const filter:any = createFilter(/(?<!\.d)\.(ets|ts)$/);

let shouldDisableCache: boolean = false;
let shouldEnableDebugLine: boolean = false;
let disableCacheOptions = {
  bundleName: 'default',
  entryModuleName: 'default',
  runtimeOS: 'default',
  resourceTableHash: 'default',
  etsLoaderVersion: 'default'
};

export function etsTransform() {
  const allFilesInHar: Map<string, string> = new Map();
  let cacheFile: CacheFile;
  if (projectConfig.useArkoala) {
    // Dynamic loading to avoid resolving arkoala-only dependencies
    const arkoalaSdkRoot: string = findArkoalaRoot();
    const pluginPackagePath: string = path.join(arkoalaSdkRoot, '@arkoala', 'rollup-plugin-ets-arkoala');
    const pluginOptions: Object = {
      arkoalaSdkRoot,
      projectConfig,
      globalModulePaths,
      getResolveModules,
    };
    return require(pluginPackagePath).makeArkoalaPlugin(pluginOptions);
  }
  return {
    name: 'etsTransform',
    transform: transform,
    buildStart() {
      const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsTransform', 'buildStart');
      startTimeStatisticsLocation(compilationTime ? compilationTime.etsTransformBuildStartTime : undefined);
      judgeCacheShouldDisabled.call(this);
      if (process.env.compileMode === 'moduleJson') {
        cacheFile = this.cache.get('transformCacheFiles');
        storedFileInfo.addGlobalCacheInfo(this.cache.get('resourceListCacheInfo'),
          this.cache.get('resourceToFileCacheInfo'));
        if (this.cache.get('lastResourcesArr')) {
          storedFileInfo.lastResourcesSet = new Set([...this.cache.get('lastResourcesArr')]);
        }
        if (process.env.rawFileResource) {
          resourcesRawfile(process.env.rawFileResource, storedFileInfo.resourcesArr);
          this.share.rawfilechanged = differenceResourcesRawfile(storedFileInfo.lastResourcesSet, storedFileInfo.resourcesArr);
        }
      }
      if (this.cache.get('enableDebugLine') !== projectConfig.enableDebugLine) {
        shouldEnableDebugLine = true;
      }
      stopTimeStatisticsLocation(compilationTime ? compilationTime.etsTransformBuildStartTime : undefined);
    },
    load(id: string) {
      let fileCacheInfo: fileInfo;
      const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsTransform', 'load');
      startTimeStatisticsLocation(compilationTime ? compilationTime.etsTransformLoadTime : undefined);
      if (this.cache.get('fileCacheInfo')) {
        fileCacheInfo = this.cache.get('fileCacheInfo')[path.resolve(id)];
      }
      // Exclude Component Preview page
      if (projectConfig.isPreview && !projectConfig.checkEntry && id.match(/(?<!\.d)\.(ets)$/)) {
        abilityPagesFullPath.push(path.resolve(id).toLowerCase());
        storedFileInfo.judgeShouldHaveEntryFiles(abilityPagesFullPath);
      }
      storedFileInfo.addFileCacheInfo(path.resolve(id), fileCacheInfo);
      storedFileInfo.setCurrentArkTsFile();
      stopTimeStatisticsLocation(compilationTime ? compilationTime.etsTransformLoadTime : undefined);
    },
    shouldInvalidCache(options) {
      const fileName: string = path.resolve(options.id);
      let shouldDisable: boolean = shouldDisableCache || disableNonEntryFileCache(fileName) || shouldEnableDebugLine;
      if (process.env.compileMode === 'moduleJson') {
        shouldDisable = shouldDisable || storedFileInfo.shouldInvalidFiles.has(fileName) || this.share.rawfilechanged;
        if (cacheFile && cacheFile[fileName] && cacheFile[fileName].children.length) {
          for (let child of cacheFile[fileName].children) {
            const newTimeMs: number = fs.existsSync(child.fileName) ? fs.statSync(child.fileName).mtimeMs : -1;
            if (newTimeMs !== child.mtimeMs) {
              shouldDisable = true;
              break;
            }
          }
        }
      }
      if (!shouldDisable) {
        storedFileInfo.collectCachedFiles(fileName);
      }
      return shouldDisable;
    },
    afterBuildEnd() {
      // Copy the cache files in the compileArkTS directory to the loader_out directory
      if (projectConfig.compileHar) {
        for (let moduleInfoId of allSourceFilePaths) {
          if (moduleInfoId && !moduleInfoId.match(new RegExp(projectConfig.packageDir)) &&
            !moduleInfoId.startsWith('\x00') &&
            path.resolve(moduleInfoId).startsWith(projectConfig.moduleRootPath + path.sep)) {
            let filePath: string = moduleInfoId;
            if (this.share.arkProjectConfig?.obfuscationMergedObConfig?.options?.enableFileNameObfuscation) {
              filePath = mangleFilePath(filePath);
            }

            const jsCacheFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
              process.env.cachePath, projectConfig);
            const jsBuildFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
              projectConfig.buildPath, projectConfig, true);
            if (filePath.match(/\.e?ts$/)) {
              setIncrementalFileInHar(jsCacheFilePath, jsBuildFilePath, allFilesInHar);
            } else {
              allFilesInHar.set(jsCacheFilePath, jsBuildFilePath);
            }
          }
        }

        allFilesInHar.forEach((jsBuildFilePath, jsCacheFilePath) => {
          if (fs.existsSync(jsCacheFilePath)) {
            const sourceCode: string = fs.readFileSync(jsCacheFilePath, 'utf-8');
            writeFileSync(jsBuildFilePath, sourceCode);
          }
        });
      }
      if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
        let widgetPath: string;
        if (projectConfig.widgetCompile) {
          widgetPath = path.resolve(projectConfig.aceModuleBuild, 'widget');
        }
        writeCollectionFile(projectConfig.cachePath, appComponentCollection,
          this.share.allComponents, 'component_collection.json', this.share.allFiles, widgetPath);
      }
      shouldDisableCache = false;
      this.cache.set('disableCacheOptions', disableCacheOptions);
      this.cache.set('lastResourcesArr', [...storedFileInfo.resourcesArr]);
      if (projectConfig.enableDebugLine) {
        this.cache.set('enableDebugLine', true);
      } else {
        this.cache.set('enableDebugLine', false);
      }
      storedFileInfo.clearCollectedInfo(this.cache);
      this.cache.set('transformCacheFiles', storedFileInfo.transformCacheFiles);
    },
    cleanUp(): void {
      resetMain();
      resetComponentMap();
      resetEtsCheck();
      resetEtsTransform();
      resetProcessComponentMember();
      resetProcessUiSyntax();
      resetUtils();
      resetValidateUiSyntax();
    }
  };
}

// If a ArkTS file don't have @Entry decorator but it is entry file this time
function disableNonEntryFileCache(filePath: string): boolean {
  return storedFileInfo.buildStart && filePath.match(/(?<!\.d)\.(ets)$/) &&
    !storedFileInfo.wholeFileInfo[filePath].hasEntry &&
    storedFileInfo.shouldHaveEntry.includes(filePath);
}

function judgeCacheShouldDisabled(): void {
  for (const key in disableCacheOptions) {
    if (this.cache.get('disableCacheOptions') && this.share &&
      this.share.projectConfig && this.share.projectConfig[key] &&
      this.cache.get('disableCacheOptions')[key] !== this.share.projectConfig[key]) {
      if (key === 'resourceTableHash' && process.env.compileMode === 'moduleJson') {
        storedFileInfo.resourceTableChanged = true;
      } else if (!shouldDisableCache) {
        shouldDisableCache = true;
      }
    }
    if (this.share && this.share.projectConfig && this.share.projectConfig[key]) {
      disableCacheOptions[key] = this.share.projectConfig[key];
    }
    storedFileInfo.judgeShouldHaveEntryFiles(abilityPagesFullPath);
  }
}

interface EmitResult {
  outputText: string,
  sourceMapText: string,
}

const compilerHost: ts.CompilerHost = ts.createCompilerHost(etsCheckerCompilerOptions);
compilerHost.writeFile = () => {};
compilerHost.resolveModuleNames = resolveModuleNames;
compilerHost.getCurrentDirectory = () => process.cwd();
compilerHost.getDefaultLibFileName = options => ts.getDefaultLibFilePath(options);
compilerHost.resolveTypeReferenceDirectives = resolveTypeReferenceDirectives;

async function transform(code: string, id: string) {
  const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsTransform', 'transform');
  if (!filter(id)) {
    return null;
  }

  storedFileInfo.collectTransformedFiles(path.resolve(id));

  const logger = this.share.getLogger('etsTransform');

  if (projectConfig.compileMode !== "esmodule") {
    const compilerOptions = ts.readConfigFile(
      path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
    compilerOptions['moduleResolution'] = 'nodenext';
    compilerOptions['module'] = 'es2020';
    const newContent: string = jsBundlePreProcess(code, id, this.getModuleInfo(id).isEntry, logger);
    const result: ts.TranspileOutput = ts.transpileModule(newContent, {
      compilerOptions: compilerOptions,
      fileName: id,
      transformers: { before: [ processUISyntax(null) ] }
    });

    resetCollection();
    if (transformLog && transformLog.errors.length && !projectConfig.ignoreWarning) {
      emitLogInfo(logger, getTransformLog(transformLog), true, id);
      resetLog();
    }

    return {
      code: result.outputText,
      map: result.sourceMapText ? JSON.parse(result.sourceMapText) : new MagicString(code).generateMap()
    };
  }

  let tsProgram: ts.Program = globalProgram.program;
  let targetSourceFile: ts.SourceFile | undefined = tsProgram.getSourceFile(id);

  // createProgram from the file which does not have corresponding ast from ets-checker's program
  // by those following cases:
  // 1. .ets/.ts imported by .js file with tsc's `allowJS` option is false.
  // 2. .ets/.ts imported by .js file with same name '.d.ts' file which is prior to .js by tsc default resolving
  if (!targetSourceFile) {
    startTimeStatisticsLocation(compilationTime ? compilationTime.noSourceFileRebuildProgramTime : undefined);
    if (storedFileInfo.isFirstBuild && storedFileInfo.changeFiles) {
      storedFileInfo.newTsProgram = ts.createProgram(storedFileInfo.changeFiles, etsCheckerCompilerOptions, compilerHost);
      storedFileInfo.isFirstBuild = false;
    }
    if (storedFileInfo.newTsProgram && storedFileInfo.newTsProgram.getSourceFile(id)) {
      tsProgram = storedFileInfo.newTsProgram;
    } else {
      tsProgram = ts.createProgram([id], etsCheckerCompilerOptions, compilerHost);
    }
    stopTimeStatisticsLocation(compilationTime ? compilationTime.noSourceFileRebuildProgramTime : undefined);
    // init TypeChecker to run binding
    globalProgram.checker = tsProgram.getTypeChecker();
    targetSourceFile = tsProgram.getSourceFile(id)!;
    storedFileInfo.reUseProgram = false;
    collectAllFiles(tsProgram);
  } else {
    if (!storedFileInfo.reUseProgram) {
      globalProgram.checker = globalProgram.program.getTypeChecker();
    }
    storedFileInfo.reUseProgram = true;
  }

  targetSourceFile.fileName = id;
  startTimeStatisticsLocation(compilationTime ? compilationTime.validateEtsTime : undefined);
  validateEts(code, id, this.getModuleInfo(id).isEntry, logger, targetSourceFile);
  stopTimeStatisticsLocation(compilationTime ? compilationTime.validateEtsTime : undefined);
  const emitResult: EmitResult = { outputText: '', sourceMapText: '' };
  const writeFile: ts.WriteFileCallback = (fileName: string, data: string) => {
    if (/.map$/.test(fileName)) {
      emitResult.sourceMapText = data;
    } else {
      emitResult.outputText = data;
    }
  }

  // close `noEmit` to make invoking emit() effective.
  tsProgram.getCompilerOptions().noEmit = false;
  // use `try finally` to restore `noEmit` when error thrown by `processUISyntax` in preview mode
  try {
    startTimeStatisticsLocation(compilationTime ? compilationTime.tsProgramEmitTime : undefined);
    tsProgram.emit(targetSourceFile, writeFile, undefined, undefined,
      {
        before: [
          processUISyntax(null, false, compilationTime),
          processKitImport()
        ]
      }
    );
    stopTimeStatisticsLocation(compilationTime ? compilationTime.tsProgramEmitTime : undefined);
  } finally {
    // restore `noEmit` to prevent tsc's watchService emitting automatically.
    tsProgram.getCompilerOptions().noEmit = true;
  }

  resetCollection();
  if (((transformLog && transformLog.errors.length) || (kitTransformLog && kitTransformLog.errors.length)) &&
    !projectConfig.ignoreWarning) {
    emitLogInfo(logger, [...getTransformLog(kitTransformLog), ...getTransformLog(transformLog)], true, id);
    resetLog();
  }

  return {
    code: emitResult.outputText,
    // Use magicString to generate sourceMap because of Typescript do not emit sourceMap in some cases
    map: emitResult.sourceMapText ? JSON.parse(emitResult.sourceMapText) : new MagicString(code).generateMap()
  };
}

function validateEts(code: string, id: string, isEntry: boolean, logger: any, sourceFile: ts.SourceFile) {
  if (/\.ets$/.test(id)) {
    clearCollection();
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(path.resolve(id).toLowerCase()) ? '?entry' : '';
    const log: LogInfo[] = validateUISyntax(code, code, id, fileQuery, sourceFile);
    if (log.length && !projectConfig.ignoreWarning) {
      emitLogInfo(logger, log, true, id);
    }
  }
}

function jsBundlePreProcess(code: string, id: string, isEntry: boolean, logger: any): string {
  if (/\.ets$/.test(id)) {
    clearCollection();
    let content = preprocessExtend(code);
    content = preprocessNewExtend(content);
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(path.resolve(id).toLowerCase()) ? '?entry' : '';
    const log: LogInfo[] = validateUISyntax(code, content, id, fileQuery);
    if (log.length && !projectConfig.ignoreWarning) {
      emitLogInfo(logger, log, true, id);
    }
    return content;
  }
  return code;
}

function clearCollection(): void {
  componentCollection.customComponents.clear();
  CUSTOM_BUILDER_METHOD.clear();
  GLOBAL_CUSTOM_BUILDER_METHOD.clear();
  INNER_CUSTOM_BUILDER_METHOD.clear();
  storedFileInfo.getCurrentArkTsFile().compFromDETS.clear();
}

function resetCollection() {
  componentInfo.id = 0;
  propertyCollection.clear();
  linkCollection.clear();
  resetComponentCollection();
}

function resetEtsTransform(): void {
  shouldEnableDebugLine = false;
  projectConfig.ignoreWarning = false;
  projectConfig.widgetCompile = false;
  disableCacheOptions = {
    bundleName: 'default',
    entryModuleName: 'default',
    runtimeOS: 'default',
    resourceTableHash: 'default',
    etsLoaderVersion: 'default'
  };
}

function findArkoalaRoot(): string {
  let arkoalaSdkRoot: string;
  if (process.env.ARKOALA_SDK_ROOT) {
    arkoalaSdkRoot = process.env.ARKOALA_SDK_ROOT;
    if (!isDir(arkoalaSdkRoot)) {
      throw new Error('Arkoala SDK not found in ' + arkoalaSdkRoot);
    }
  } else {
    const arkoalaPossiblePaths: string[] = globalModulePaths.map(dir => path.join(dir, '../../arkoala'));
    arkoalaSdkRoot = arkoalaPossiblePaths.find(possibleRootDir => isDir(possibleRootDir)) ?? '';
    if (!arkoalaSdkRoot) {
      throw new Error('Arkoala SDK not found in ' + arkoalaPossiblePaths.join(';'));
    }
  }

  return arkoalaSdkRoot;
}

function isDir(filePath: string): boolean {
  try {
    let stat: fs.Stats = fs.statSync(filePath);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

function setIncrementalFileInHar(jsCacheFilePath: string, jsBuildFilePath: string, allFilesInHar: Map<string, string>): void {
  allFilesInHar.set(jsCacheFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'),
    jsBuildFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'));
  allFilesInHar.set(jsCacheFilePath.replace(/\.e?ts$/, '.js'), jsBuildFilePath.replace(/\.e?ts$/, '.js'));
}