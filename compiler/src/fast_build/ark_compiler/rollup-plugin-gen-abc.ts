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

import { initArkProjectConfig } from './common/process_ark_config';
import { generateBundleAbc } from './generate_bundle_abc';
import { generateModuleAbc } from './generate_module_abc';
import { transformForModule } from './transform';
import { cleanUpObjects } from './utils';
import { checkArkCompilerCacheInfo, shouldInvalidCache } from './cache';
import { checkIfJsImportingArkts } from './check_import_module';
import { compilerOptions } from '../../ets_checker';
import { ModuleSourceFile } from './module/module_source_file';

export function genAbc() {
  return {
    name: 'genAbc',
    buildStart() {
      this.share.arkProjectConfig = initArkProjectConfig(this.share);
      checkArkCompilerCacheInfo(this);
    },
    shouldInvalidCache: shouldInvalidCache,
    transform: transformForModule,
    beforeBuildEnd: {
      // [pre] means this handler running in first at the stage of beforeBuildEnd.
      order: 'pre',
      handler() {
        if (compilerOptions.needDoArkTsLinter) {
          checkIfJsImportingArkts(this);
        }
        if (this.share.projectConfig.needCoverageInsert) {
          this.share.ModuleSourceFile = ModuleSourceFile.getSourceFiles();
        }
      }
    },
    buildEnd: generateModuleAbc,
    generateBundle: generateBundleAbc,
    cleanUp: cleanUpObjects
  };
}
