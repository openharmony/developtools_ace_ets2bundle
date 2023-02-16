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
  writeFileSync
} from '../../utils';
import {
  preprocessExtend,
  preprocessNewExtend,
  validateUISyntax,
  propertyCollection,
  linkCollection,
  resetComponentCollection
} from '../../validate_ui_syntax';
import {
  processUISyntax,
  resetLog,
  transformLog
} from '../../process_ui_syntax';
import {
  abilityConfig,
  projectConfig,
  abilityPagesFullPath
} from '../../../main';
import {
  JSBUNDLE,
  ESMODULE
} from '../../pre_define';
import { parseVisual } from '../../process_visual';

const filter:any = createFilter(/(?<!\.d)\.(ets|ts)$/);
const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
compilerOptions['moduleResolution'] = 'nodenext';
compilerOptions['module'] = 'es2020';

export function etsTransform() {
  const incrementalFileInHar: Map<string, string> = new Map();
  return {
    name: 'etsTransform',
    transform: transform,
    renderChunk(code, chunk) {
      const magicString = new MagicString(code);
      if (projectConfig.compileMode === JSBUNDLE &&
        [abilityConfig.abilityEntryFile].concat(abilityConfig.projectAbilityPath)
          .concat(abilityConfig.testRunnerFile).includes(chunk.facadeModuleId)) {
        code = code.replace(/module\.exports/, 'globalThis.exports.default');
      }
      return {
        code: code,
        map: magicString.generateMap()
      };
    },
    moduleParsed(moduleInfo) {
      if (projectConfig.compileHar) {
        if (moduleInfo.id && !moduleInfo.id.match(/node_modules/)) {
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
    buildEnd: {
      order: 'post',
      handler() {
        if (projectConfig.compileHar) {
          incrementalFileInHar.forEach((jsBuildFilePath, jsCacheFilePath) => {
            const sourceCode: string = fs.readFileSync(jsCacheFilePath, 'utf-8');
            writeFileSync(jsBuildFilePath, sourceCode);
          });
        }
      }
    }
  };
}

function transform(code: string, id: string) {
  if (!filter(id)) {
    return null;
  }

  if (projectConfig.compileMode === ESMODULE) {
    compilerOptions['importsNotUsedAsValues'] = 'remove';
  }

  const logger = this.share.getLogger('etsTransform');

  const magicString = new MagicString(code);
  const newContent: string = preProcess(code, id, this.getModuleInfo(id).isEntry, logger);

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
    map: result.sourceMapText ? JSON.parse(result.sourceMapText) : magicString.generateMap()
  };
}

function preProcess(code: string, id: string, isEntry: boolean, logger: any): string {
  if (/\.ets$/.test(id)) {
    let content = preprocessExtend(code);
    content = preprocessNewExtend(content);
    const fileQuery: string = isEntry && !abilityPagesFullPath.includes(id) ? '?entry' : '';
    const log: LogInfo[] = validateUISyntax(code, content, id, fileQuery);
    content = parseVisual(id, fileQuery, content, log, code, true);
    if (log.length) {
      emitLogInfo(logger, log, true, id);
    }
    return content;
  }
  return code;
}

function resetCollection() {
  componentInfo.id = 0;
  propertyCollection.clear();
  linkCollection.clear();
  resetComponentCollection();
}
