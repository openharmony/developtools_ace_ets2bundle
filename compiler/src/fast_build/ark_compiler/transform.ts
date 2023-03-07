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
  isTsOrEtsSourceFile
} from './utils';
import { toUnixPath } from '../../utils';

export let newSourceMaps: Object = {};

/**
 * rollup transform hook
 * @param {string} code: transformed source code of an input file
 * @param {string} id: absolute path of an input file
 */
export function transformForModule(code: string, id: string) {
  if (this.share.projectConfig.compileMode === ESMODULE) {
    const projectConfig: any = Object.assign(this.share.arkProjectConfig, this.share.projectConfig);
    if (isTsOrEtsSourceFile(id) && !isAotMode(projectConfig)) {
      preserveSourceMap(id, this.getCombinedSourcemap(), projectConfig);
      ModuleSourceFile.newSourceFile(id, code);
    }

    if (isJsSourceFile(id) || isJsonSourceFile(id)) {
      let code: string = this.getModuleInfo(id).originalCode;
      if (isJsSourceFile(id)) {
        const transformedResult: any = transformJsByBabelPlugin(code);
        code = transformedResult.code;
        preserveSourceMap(id, transformedResult.map, projectConfig);
      }
      ModuleSourceFile.newSourceFile(id, code);
    }
  }
}

function preserveSourceMap(sourceFilePath: string, sourcemap: any, projectConfig: any): void {
  if (isCommonJsPluginVirtualFile(sourceFilePath)) {
    // skip automatic generated files like 'jsfile.js?commonjs-exports'
    return;
  }

  const relativeSourceFilePath = toUnixPath(sourceFilePath.replace(projectConfig.projectRootPath + path.sep, ''));
  sourcemap['sources'] = [ relativeSourceFilePath ];
  sourcemap['file'] = path.basename(relativeSourceFilePath);
  sourcemap.sourcesContent && delete sourcemap.sourcesContent;
  newSourceMaps[relativeSourceFilePath] = sourcemap;
}

function transformJsByBabelPlugin(code: string): any {
  const transformed: any = require('@babel/core').transformSync(code,
    {
      plugins: [
        [require("@babel/plugin-proposal-class-properties"), { "loose": true }]
      ],
      compact: false,
      sourceMaps: true
    }
  );
  return transformed;
}
