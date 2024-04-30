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

import {
  ESMODULE
} from './common/ark_define';
import { ModuleSourceFile } from './module/module_source_file';
import {
  isAotMode,
  isCommonJsPluginVirtualFile,
  isDebug,
  isJsonSourceFile,
  isJsSourceFile,
  isTsOrEtsSourceFile,
  shouldETSOrTSFileTransformToJS
} from './utils';
import { toUnixPath } from '../../utils';
import {
  getHookEventFactory,
  createAndStartEvent,
  stopEvent
} from '../../ark_utils';
import { SourceMapGenerator } from './generate_sourcemap';

/**
 * rollup transform hook
 * @param {string} code: transformed source code of an input file
 * @param {string} id: absolute path of an input file
 */
export function transformForModule(code: string, id: string) {
  const hookEventFactory = getHookEventFactory(this.share, 'genAbc', 'transform');
  const eventTransformForModule = createAndStartEvent(hookEventFactory, 'transform for module');
  if (this.share.projectConfig.compileMode === ESMODULE) {
    const projectConfig: Object = Object.assign(this.share.arkProjectConfig, this.share.projectConfig);
    if (isTsOrEtsSourceFile(id) && shouldETSOrTSFileTransformToJS(id, projectConfig)) {
      preserveSourceMap(id, this.getCombinedSourcemap(), projectConfig, eventTransformForModule);
      ModuleSourceFile.newSourceFile(id, code);
    }

    if (isJsSourceFile(id) || isJsonSourceFile(id)) {
      let code: string = this.getModuleInfo(id).originalCode;
      if (isJsSourceFile(id)) {
        if (projectConfig.compatibleSdkVersion <= 10) {
          const transformedResult: object = transformJsByBabelPlugin(code, eventTransformForModule);
          code = transformedResult.code;
          preserveSourceMap(id, transformedResult.map, projectConfig, eventTransformForModule);
        } else {
          // preserve sourceMap of js file without transforming
          preserveSourceMap(id, this.getCombinedSourcemap(), projectConfig, eventTransformForModule);
        }
      }
      ModuleSourceFile.newSourceFile(id, code);
    }
  }
  stopEvent(eventTransformForModule);
}

function preserveSourceMap(sourceFilePath: string, sourcemap: Object, projectConfig: Object, parentEvent: Object): void {
  if (isCommonJsPluginVirtualFile(sourceFilePath)) {
    // skip automatic generated files like 'jsfile.js?commonjs-exports'
    return;
  }

  const eventAddSourceMapInfo = createAndStartEvent(parentEvent, 'preserve source map for ts/ets files');
  const relativeSourceFilePath = toUnixPath(sourceFilePath.replace(projectConfig.projectRootPath + path.sep, ''));
  sourcemap['sources'] = [relativeSourceFilePath];
  sourcemap['file'] = path.basename(relativeSourceFilePath);
  sourcemap.sourcesContent && delete sourcemap.sourcesContent;
  const sourceMapGenerator = SourceMapGenerator.getInstance();
  const key = sourceMapGenerator.isNewSourceMaps() ? sourceFilePath : relativeSourceFilePath;
  sourceMapGenerator.fillSourceMapPackageInfo(sourceFilePath, sourcemap);
  sourceMapGenerator.updateSourceMap(key, sourcemap);
  stopEvent(eventAddSourceMapInfo);
}

function transformJsByBabelPlugin(code: string, parentEvent: Object): Object {
  const eventTransformByBabel = createAndStartEvent(parentEvent, 'transform Js by babel plugin');
  const transformed: Object = require('@babel/core').transformSync(code,
    {
      plugins: [
        [require("@babel/plugin-proposal-class-properties"), { "loose": true }]
      ],
      compact: false,
      sourceMaps: true
    }
  );
  stopEvent(eventTransformByBabel);
  return transformed;
}