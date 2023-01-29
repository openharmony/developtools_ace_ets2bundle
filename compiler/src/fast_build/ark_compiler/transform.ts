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

import { DEBUG } from '../common/common_define';
import {
  EXTNAME_JS,
  EXTNAME_MJS,
  EXTNAME_CJS,
  ESMODULE,
  EXTNAME_ETS,
  EXTNAME_TS
} from './common/ark_define';
import { ModuleSourceFile } from "./module/module_source_file";
import { isSpecifiedExt } from './utils';
import { toUnixPath } from '../../utils';

export let newSourceMaps: Object = {};

/**
 * rollup transform hook
 * @param {string} code
 * @param {string} id
 */
export function transformForModule(code: string, id: string) {
  if (this.share.projectConfig.compileMode === ESMODULE) {
    const projectConfig: any = Object.assign(this.share.arkProjectConfig, this.share.projectConfig);
    preserveTsAndEtsSourceContent(id, code);
    preserveSourceMap(id, this.getCombinedSourcemap(), projectConfig);
  }
}

function preserveTsAndEtsSourceContent(sourceFilePath: string, code: string): void {
  if (isSpecifiedExt(sourceFilePath, EXTNAME_ETS) || isSpecifiedExt(sourceFilePath, EXTNAME_TS)) {
    ModuleSourceFile.newSourceFile(sourceFilePath, code);
  }
}

function preserveSourceMap(sourceFilePath: string, sourcemap: any, projectConfig: any): void {
  if (projectConfig.buildArkMode.toLowerCase() !== DEBUG) {
    return;
  }

  if (sourceFilePath.includes('\x00') || isSpecifiedExt(sourceFilePath, EXTNAME_JS) ||
    isSpecifiedExt(sourceFilePath, EXTNAME_MJS) || isSpecifiedExt(sourceFilePath, EXTNAME_CJS)) {
    // skip automatic generated files like 'jsfile.js?commonjs-exports'
    // skip js/cjs/mjs file sourcemap
    return;
  }

  sourcemap['sources'] = toUnixPath(sourceFilePath.replace(projectConfig.projectRootPath + path.sep, ''));
  newSourceMaps[toUnixPath(sourceFilePath.replace(projectConfig.projectRootPath + path.sep, ''))] = sourcemap;
}
