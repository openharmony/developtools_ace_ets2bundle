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
import nodeEvents from 'node:events';

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
import { mangleFilePath, resetObfuscation } from '../ark_compiler/common/ob_config_resolver';
import arkoalaProgramTransform, { ArkoalaPluginOptions } from './arkoala-plugin';
import processStructComponentV2 from '../../process_struct_componentV2';

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
      // If a file import an const enum object from other changed file, this file also need to be transformed.
      shouldDisable = shouldDisable || checkRelateToConstEnum(options.id);
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

            const cacheFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
              process.env.cachePath, projectConfig);
            const buildFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
              projectConfig.buildPath, projectConfig, true);
            if (filePath.match(/\.e?ts$/)) {
              setIncrementalFileInHar(cacheFilePath, buildFilePath, allFilesInHar);
            } else {
              allFilesInHar.set(cacheFilePath, buildFilePath);
            }
          }
        }

        allFilesInHar.forEach((buildFilePath, cacheFilePath) => {
          // if the ts or ets file code only contain interface, it doesn't have js file.
          if (fs.existsSync(cacheFilePath)) {
            const sourceCode: string = fs.readFileSync(cacheFilePath, 'utf-8');
            writeFileSync(buildFilePath, sourceCode);
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
      resetObfuscation();
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

const arkoalaTsProgramCache: WeakMap<ts.Program, ts.Program> = new WeakMap();

function getArkoalaTsProgram(program: ts.Program): ts.Program {
  let extendedProgram = arkoalaTsProgramCache.get(program);
  if (!extendedProgram) {
    const pluginOptions: ArkoalaPluginOptions = {};
    // This is a stub for the interface generated by ts-patch.
    // Probably we can use the reported diagnostics in the output
    const pluginTransformExtras: Object = {
      diagnostics: [],
      addDiagnostic(): number {return 0},
      removeDiagnostic(): void {},
      ts: ts,
      library: 'typescript',
    };
    extendedProgram = arkoalaProgramTransform(program, compilerHost, pluginOptions, pluginTransformExtras);
    arkoalaTsProgramCache.set(program, extendedProgram);
  }
  return extendedProgram;
}

async function transform(code: string, id: string) {
  const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsTransform', 'transform');
  if (!filter(id)) {
    return null;
  }

  storedFileInfo.collectTransformedFiles(path.resolve(id));

  const logger = this.share.getLogger('etsTransform');

  if (projectConfig.compileMode !== 'esmodule') {
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
    stopTimeStatisticsLocation(compilationTime ? compilationTime.noSourceFileRebuildProgramTime : undefined);
    if (storedFileInfo.newTsProgram && storedFileInfo.newTsProgram.getSourceFile(id)) {
      tsProgram = storedFileInfo.newTsProgram;
    } else {
      await CreateProgramMoment.block(id); 
      if (storedFileInfo.newTsProgram && storedFileInfo.newTsProgram.getSourceFile(id)) {
        tsProgram = storedFileInfo.newTsProgram;
      } else {
        startTimeStatisticsLocation(compilationTime ? compilationTime.noSourceFileRebuildProgramTime : undefined);
        tsProgram = ts.createProgram(CreateProgramMoment.getRoots(id), etsCheckerCompilerOptions, compilerHost);
        storedFileInfo.newTsProgram = tsProgram;
        stopTimeStatisticsLocation(compilationTime ? compilationTime.noSourceFileRebuildProgramTime : undefined);
      }
    }
   
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
    if (projectConfig.useArkoala) {
      tsProgram = getArkoalaTsProgram(tsProgram);
      targetSourceFile = tsProgram.getSourceFile(id);
    }
    tsProgram.emit(targetSourceFile, writeFile, undefined, undefined,
      {
        before: [
          processUISyntax(null, false, compilationTime),
          processKitImport(id)
        ]
      }
    );
    stopTimeStatisticsLocation(compilationTime ? compilationTime.tsProgramEmitTime : undefined);
  } finally {
    // restore `noEmit` to prevent tsc's watchService emitting automatically.
    tsProgram.getCompilerOptions().noEmit = true;
  }

  resetCollection();
  processStructComponentV2.resetStructMapInEts();
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

function setIncrementalFileInHar(cacheFilePath: string, buildFilePath: string, allFilesInHar: Map<string, string>): void {
  if (cacheFilePath.match(/\.d.e?ts$/)) {
    allFilesInHar.set(cacheFilePath, buildFilePath);
    return;
  }
  let extName = projectConfig.useTsHar ? '.ts' : '.js';
  allFilesInHar.set(cacheFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'),
    buildFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'));
  allFilesInHar.set(cacheFilePath.replace(/\.e?ts$/, extName), buildFilePath.replace(/\.e?ts$/, extName));
}

function checkRelateToConstEnum(id: string): boolean {
  let tsProgram: ts.Program = globalProgram.builderProgram;
  let targetSourceFile: ts.SourceFile | undefined = tsProgram ? tsProgram.getSourceFile(id) : undefined;
  if (!targetSourceFile) {
    return false;
  }
  if (!tsProgram.isFileUpdateInConstEnumCache) {
    return false;
  }
  return tsProgram.isFileUpdateInConstEnumCache(targetSourceFile);
}

class CreateProgramMoment {
  static transCount: number = 0;
  static awaitCount: number = 0;
  static moduleParsedCount: number = 0;
  static promise: Promise<void> = undefined;
  static emitter = undefined;
  static roots: string[] = [];

  static init(): void {
    if (CreateProgramMoment.promise) {
      return;
    }
    CreateProgramMoment.emitter = new nodeEvents.EventEmitter();
    CreateProgramMoment.promise = new Promise<void>(resolve => {
      CreateProgramMoment.emitter.on('checkPrefCreateProgramId', () => {
        if (CreateProgramMoment.awaitCount + CreateProgramMoment.moduleParsedCount === CreateProgramMoment.transCount) {
          resolve();
        }
      });
    });
  }

  static getPlugin() {
    return {
      name: 'createProgramPlugin',
      transform: {
        order: 'pre',
        handler(): void {
          CreateProgramMoment.transCount++;
        }
      },
      moduleParsed(): void {
        CreateProgramMoment.moduleParsedCount++;
        CreateProgramMoment.emitter?.emit('checkPrefCreateProgramId');
      },
      cleanUp(): void {
        CreateProgramMoment.reset();
      }
    };
  }

  static async block(id: string): Promise<void> {
    CreateProgramMoment.init();
    CreateProgramMoment.awaitCount++;
    CreateProgramMoment.roots.push(id);
    CreateProgramMoment.emitter.emit('checkPrefCreateProgramId');
    return CreateProgramMoment.promise;
  }

  static reset(): void {
    CreateProgramMoment.transCount = 0;
    CreateProgramMoment.awaitCount = 0;
    CreateProgramMoment.moduleParsedCount = 0;
    CreateProgramMoment.promise = undefined;
    CreateProgramMoment.emitter = undefined;
    CreateProgramMoment.roots = [];
  }

  static getRoots(id: string): string[] {
    const res = [];
    CreateProgramMoment.roots.forEach(id => res.push(id));
    CreateProgramMoment.promise = undefined;
    CreateProgramMoment.emitter = undefined;
    CreateProgramMoment.roots = [];
    if (res.length === 0) {
      return [id];
    }
    return res;
  }
}

exports.createProgramPlugin = CreateProgramMoment.getPlugin;
