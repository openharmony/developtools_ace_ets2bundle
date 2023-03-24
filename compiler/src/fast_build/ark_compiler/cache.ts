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

import {
  ARK_COMPILER_META_INFO,
  ESMODULE,
  IS_CACHE_INVALID
} from './common/ark_define';

let disableCache: boolean = false;
export function checkArkCompilerCacheInfo(rollupObject: any): void {
  disableCache = false;
  const metaInfo: string = getMetaInfo(rollupObject.share.projectConfig);
  const lastMetaInfo: string = rollupObject.cache.get(ARK_COMPILER_META_INFO);
  if (!lastMetaInfo || metaInfo !== lastMetaInfo) {
    rollupObject.cache.set(IS_CACHE_INVALID, true);
    disableCache = true;
  }
  rollupObject.cache.set(ARK_COMPILER_META_INFO, metaInfo);
}

function getMetaInfo(projectConfig: any): string {
  let metaInfoArr: string[] = [];
  // user selects the compiled API version information
  const compileSdkVersion: string = projectConfig.compileSdkVersion ?
    projectConfig.compileSdkVersion : 'null_compileSdkVersion';
  // user selects the compatible API version information
  const compatibleSdkVersion: string = projectConfig.compatibleSdkVersion ?
    projectConfig.compatibleSdkVersion : 'null_compatibleSdkVersion';
  const runtimeOS: string = projectConfig.runtimeOS ? projectConfig.runtimeOS : 'null_runtimeOS';
  const sdkPath: string = projectConfig.etsLoaderPath ?
    projectConfig.etsLoaderPath : 'null_sdkPath';
  // version information for loading SDKs in the IDE
  const sdkVersion: string = projectConfig.etsLoaderVersion ?
    projectConfig.etsLoaderVersion : 'null_sdkVersion';
  const sdkReleaseType: string = projectConfig.etsLoaderReleaseType ?
    projectConfig.etsLoaderReleaseType : 'null_sdkReleaseType';
  metaInfoArr.push(compileSdkVersion, compatibleSdkVersion, runtimeOS, sdkPath, sdkVersion, sdkReleaseType);

  if (projectConfig.compileMode === ESMODULE) {
    const bundleName: string = projectConfig.bundleName ? projectConfig.bundleName : 'null_bundleName';
    const allModuleNameHash: string = projectConfig.allModuleNameHash ? projectConfig.allModuleNameHash :
      'null_allModuleNameHash';
    const aotCompileMode: string = projectConfig.aotCompileMode ? projectConfig.aotCompileMode : 'null_aotCompileMode';
    const apPath: string = projectConfig.apPath ? projectConfig.apPath : 'null_apPath';
    metaInfoArr.push(bundleName, allModuleNameHash, aotCompileMode, apPath);
  }

  return metaInfoArr.join(':');
}

/**
 * rollup shouldInvalidCache hook
 * @param {rollup OutputOptions} options
 */
export function shouldInvalidCache(): boolean {
  return disableCache;
}
