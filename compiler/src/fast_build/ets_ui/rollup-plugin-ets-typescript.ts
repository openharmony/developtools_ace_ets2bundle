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
  storedFileInfo,
  fileInfo
} from '../../utils';
import {
  preprocessExtend,
  preprocessNewExtend,
  validateUISyntax,
  propertyCollection,
  linkCollection,
  resetComponentCollection,
  componentCollection
} from '../../validate_ui_syntax';
import {
  processUISyntax,
  resetLog,
  transformLog
} from '../../process_ui_syntax';
import {
  projectConfig,
  abilityPagesFullPath,
  globalProgram
} from '../../../main';
import {
  compilerOptions as etsCheckerCompilerOptions,
  resolveModuleNames
} from '../../ets_checker';
import {
  CUSTOM_BUILDER_METHOD,
  GLOBAL_CUSTOM_BUILDER_METHOD,
  INNER_CUSTOM_BUILDER_METHOD
} from '../../component_map';
import { tsWatchEndPromise } from './rollup-plugin-ets-checker';

const filter:any = createFilter(/(?<!\.d)\.(ets|ts)$/);

let shouldDisableCache: boolean = false;
const disableCacheOptions = {
  bundleName: 'default',
  entryModuleName: 'default',
  runtimeOS: 'default',
  resourceTableHash: 'default',
  etsLoaderVersion: 'default'
};

export function etsTransform() {
  const incrementalFileInHar: Map<string, string> = new Map();
  return {
    name: 'etsTransform',
    transform: transform,
    buildStart: judgeCacheShouldDisabled,
    load(id: string) {
      let fileCacheInfo: fileInfo;
      if (this.cache.get('fileCacheInfo')) {
        fileCacheInfo = this.cache.get('fileCacheInfo')[path.resolve(id)];
      }
      // Exclude Component Preview page
      if (projectConfig.isPreview && !projectConfig.checkEntry && id.match(/(?<!\.d)\.(ets)$/)) {
        abilityPagesFullPath.push(path.resolve(id).toLowerCase());
        storedFileInfo.judgeShouldHaveEntryFiles(abilityPagesFullPath);
      }
      storedFileInfo.addFileCacheInfo(path.resolve(id), fileCacheInfo);
    },
    shouldInvalidCache(options) {
      const fileName: string = path.resolve(options.id);
      const shouldDisable: boolean = shouldDisableCache || disableNonEntryFileCache(fileName);
      if (!shouldDisable) {
        storedFileInfo.collectCachedFiles(fileName);
      }
      return shouldDisable;
    },
    moduleParsed(moduleInfo) {
      if (projectConfig.compileHar) {
        if (moduleInfo.id && !moduleInfo.id.match(new RegExp(projectConfig.packageDir)) &&
          !moduleInfo.id.startsWith('\x00') &&
          path.resolve(moduleInfo.id).startsWith(projectConfig.moduleRootPath + path.sep)) {
          const filePath: string = moduleInfo.id;
          const jsCacheFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
            process.env.cachePath, projectConfig);
          const jsBuildFilePath: string = genTemporaryPath(filePath, projectConfig.moduleRootPath,
            projectConfig.buildPath, projectConfig, true);
          if (filePath.match(/\.e?ts$/)) {
            incrementalFileInHar.set(jsCacheFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'),
              jsBuildFilePath.replace(/\.ets$/, '.d.ets').replace(/\.ts$/, '.d.ts'));
            incrementalFileInHar.set(jsCacheFilePath.replace(/\.e?ts$/, '.js'), jsBuildFilePath.replace(/\.e?ts$/, '.js'));
          } else {
            incrementalFileInHar.set(jsCacheFilePath, jsBuildFilePath);
          }
        }
      }
    },
    afterBuildEnd() {
      if (projectConfig.compileHar) {
        incrementalFileInHar.forEach((jsBuildFilePath, jsCacheFilePath) => {
          if (fs.existsSync(jsCacheFilePath)) {
            const sourceCode: string = fs.readFileSync(jsCacheFilePath, 'utf-8');
            writeFileSync(jsBuildFilePath, sourceCode);
          }
        });
      }
      shouldDisableCache = false;
      this.cache.set('disableCacheOptions', disableCacheOptions);
      storedFileInfo.buildStart = false;
      storedFileInfo.saveCacheFileInfo(this.cache);
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
    if (!shouldDisableCache && this.cache.get('disableCacheOptions') && this.share &&
      this.share.projectConfig && this.share.projectConfig[key] &&
      this.cache.get('disableCacheOptions')[key] !== this.share.projectConfig[key]) {
      shouldDisableCache = true;
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

async function transform(code: string, id: string) {
  if (!filter(id)) {
    return null;
  }

  storedFileInfo.collectTransformedFiles(path.resolve(id));

  const logger = this.share.getLogger('etsTransform');

  if (projectConfig.compileMode !== "esmodule") {
    const compilerOptions = ts.readConfigFile(
      path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
    compilerOptions['moduleResolution'] = 'nodenext';
    compilerOptions['module'] = 'es2020'
    const newContent: string = jsBundlePreProcess(code, id, this.getModuleInfo(id).isEntry, logger);
    const result: ts.TranspileOutput = ts.transpileModule(newContent, {
      compilerOptions: compilerOptions,
      fileName: id,
      transformers: { before: [ processUISyntax(null) ] }
    });

    resetCollection();
    if (transformLog && transformLog.errors.length) {
      emitLogInfo(logger, getTransformLog(transformLog), true, id);
      resetLog();
    }

    return {
      code: result.outputText,
      map: result.sourceMapText ? JSON.parse(result.sourceMapText) : new MagicString(code).generateMap()
    };
  }

  if (process.env.watchMode === 'true' && process.env.triggerTsWatch === 'true') {
    // need to wait the tsc watch end signal to continue emitting in watch mode
    await tsWatchEndPromise;
  }

  let tsProgram: ts.Program = process.env.watchMode !== 'true' ?
    globalProgram.program : globalProgram.watchProgram.getCurrentProgram().getProgram();
  let targetSourceFile: ts.SourceFile | undefined = tsProgram.getSourceFile(id);

  // createProgram from the file which does not have corresponding ast from ets-checker's program
  if (!targetSourceFile) {
    tsProgram = ts.createProgram([id], etsCheckerCompilerOptions, compilerHost);
    targetSourceFile = tsProgram.getSourceFile(id)!;
  }

  validateEts(code, id, this.getModuleInfo(id).isEntry, logger);

  const emitResult: EmitResult = { outputText: '', sourceMapText: '' };
  const writeFile: ts.WriteFileCallback = (fileName: string, data: string) => {
    if (/.map$/.test(fileName)) {
      emitResult.sourceMapText = data;
    } else {
      emitResult.outputText = data;
    }
  }

  try {
    // close `noEmit` to make invoking emit() effective.
    tsProgram.getCompilerOptions().noEmit = false;
    tsProgram.emit(targetSourceFile, writeFile, undefined, undefined, { before: [ processUISyntax(null) ] });
  } finally {
    // restore `noEmit` to prevent tsc's watchService emitting automatically.
    tsProgram.getCompilerOptions().noEmit = true;
  }

  resetCollection();
  if (transformLog && transformLog.errors.length) {
    emitLogInfo(logger, getTransformLog(transformLog), true, id);
    resetLog();
  }

  return {
    code: emitResult.outputText,
    // Use magicString to generate sourceMap because of Typescript do not emit sourceMap in watchMode
    map: emitResult.sourceMapText ? JSON.parse(emitResult.sourceMapText) : new MagicString(code).generateMap()
  };
}

function validateEts(code: string, id: string, isEntry: boolean, logger: any) {
  if (/\.ets$/.test(id)) {
    clearCollection();
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(path.resolve(id).toLowerCase()) ? '?entry' : '';
    const log: LogInfo[] = validateUISyntax(code, code, id, fileQuery);
    if (log.length) {
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
    if (log.length) {
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
}

function resetCollection() {
  componentInfo.id = 0;
  propertyCollection.clear();
  linkCollection.clear();
  resetComponentCollection();
}
