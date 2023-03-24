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
  generateCollectionFile
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
import { ESMODULE } from '../../pre_define';
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

const filter:any = createFilter(/(?<!\.d)\.(ets|ts)$/);
const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
compilerOptions['moduleResolution'] = 'nodenext';
compilerOptions['module'] = 'es2020';

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

function transform(code: string, id: string) {
  if (!filter(id)) {
    return null;
  }

  if (projectConfig.compileMode === ESMODULE) {
    compilerOptions['importsNotUsedAsValues'] = 'remove';
  }

  const logger = this.share.getLogger('etsTransform');

  let result;
  if (process.env.watchMode !== 'true') {
    let tsProgram: ts.Program = globalProgram.program;
    let targetSourceFile: ts.SourceFile | undefined = tsProgram.getSourceFile(id);
    // createProgram from the file which does not have corresponding ast from ets-checker's program
    if (!targetSourceFile) {
      if (/\.ets$/.test(id)) {
        logger.error('\u001b[31m' + `ArkTS:ERROR: the .ets file ${id} cann't be imported by .js file`);
      }
      tsProgram = ts.createProgram([id], etsCheckerCompilerOptions, compilerHost);
      targetSourceFile = tsProgram.getSourceFile(id)!;
    }

    if (/\.ets$/.test(id)) {
      const fileQuery: string = this.getModuleInfo(id).isEntry &&
        !abilityPagesFullPath.includes(id) ? '?entry' : '';
      const log: LogInfo[] = validateUISyntax(code, code, id, fileQuery, targetSourceFile);
      if (log.length) {
        emitLogInfo(logger, log, true, id);
      }
    }

    const emitResult: EmitResult = { outputText: '', sourceMapText: '' };
    const writeFile: ts.WriteFileCallback = (fileName: string, data: string) => {
      if (/.map$/.test(fileName)) {
        emitResult.sourceMapText = data;
      } else {
        emitResult.outputText = data;
      }
    }

    tsProgram.emit(targetSourceFile, writeFile, undefined, undefined, { before: [ processUISyntax(null) ] });
    result = {
      code: emitResult.outputText,
      map: JSON.parse(emitResult.sourceMapText)
    };
  } else {
    const magicString = new MagicString(code);
    const newContent: string = preProcess(code, id, this.getModuleInfo(id).isEntry, logger);

    const transpileResult: ts.TranspileOutput = ts.transpileModule(newContent, {
      compilerOptions: compilerOptions,
      fileName: id,
      transformers: { before: [ processUISyntax(null) ] }
    });
    result = {
      code: transpileResult.outputText,
      map: transpileResult.sourceMapText ? JSON.parse(transpileResult.sourceMapText) : magicString.generateMap()
    };
  }
  resetCollection();
  if (transformLog && transformLog.errors.length) {
    emitLogInfo(logger, getTransformLog(transformLog), true, id);
    resetLog();
  }

  return result;
}

function preProcess(code: string, id: string, isEntry: boolean, logger: any): string {
  if (/\.ets$/.test(id)) {
    clearCollection();
    let content = preprocessExtend(code);
    content = preprocessNewExtend(content);
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(id) ? '?entry' : '';
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
