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
  generateCollectionFile
} from '../../utils';
import {
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
  appComponentCollection,
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
    shouldInvalidCache(options) {
      return shouldDisableCache;
    },
    moduleParsed(moduleInfo) {
      if (projectConfig.compileHar) {
        if (moduleInfo.id && !moduleInfo.id.match(/node_modules/) && !moduleInfo.id.startsWith('\x00')) {
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
          const sourceCode: string = fs.readFileSync(jsCacheFilePath, 'utf-8');
          writeFileSync(jsBuildFilePath, sourceCode);
        });
      }
      if (!projectConfig.isPreview) {
        generateCollectionFile(projectConfig, appComponentCollection);
      }
      shouldDisableCache = false;
      this.cache.set('disableCacheOptions', disableCacheOptions);
    }
  };
}

function judgeCacheShouldDisabled() {
  for (const key in disableCacheOptions) {
    if (!shouldDisableCache && this.cache.get('disableCacheOptions') && this.share &&
      this.share.projectConfig && this.share.projectConfig[key] &&
      this.cache.get('disableCacheOptions')[key] !== this.share.projectConfig[key]) {
      shouldDisableCache = true;
    }
    if (this.share && this.share.projectConfig && this.share.projectConfig[key]) {
      disableCacheOptions[key] = this.share.projectConfig[key];
    }
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

  const logger = this.share.getLogger('etsTransform');

  if (process.env.watchMode === 'true') {
    // need to wait the tsc watch end signal to continue emitting in watch mode
    await tsWatchEndPromise;
  }

  let tsProgram: ts.Program = process.env.watchMode !== 'true' ?
    globalProgram.program : globalProgram.watchProgram.getProgram();
  let targetSourceFile: ts.SourceFile | undefined = tsProgram.getSourceFile(id);
  // createProgram from the file which does not have corresponding ast from ets-checker's program
  if (!targetSourceFile) {
    tsProgram = ts.createProgram([id], etsCheckerCompilerOptions, compilerHost);
    targetSourceFile = tsProgram.getSourceFile(id)!;
  }

  validateEts(code, id, this.getModuleInfo(id).isEntry, targetSourceFile, logger);

  const emitResult: EmitResult = { outputText: '', sourceMapText: '' };
  const writeFile: ts.WriteFileCallback = (fileName: string, data: string) => {
    if (/.map$/.test(fileName)) {
      emitResult.sourceMapText = data;
    } else {
      emitResult.outputText = data;
    }
  }

  tsProgram.emit(targetSourceFile, writeFile, undefined, undefined, { before: [ processUISyntax(null) ] });

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

function validateEts(code: string, id: string, isEntry: boolean, targetSourceFile: ts.SourceFile, logger: any) {
  if (/\.ets$/.test(id)) {
    clearCollection();
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(id) ? '?entry' : '';
    const log: LogInfo[] = validateUISyntax(code, code, id, fileQuery, targetSourceFile);
    if (log.length) {
      emitLogInfo(logger, log, true, id);
    }
  }
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
