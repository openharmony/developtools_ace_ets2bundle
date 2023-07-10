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

import MagicString from 'magic-string';
import { createFilter } from '@rollup/pluginutils';
import path from 'path';
import {
  NATIVE_MODULE,
  ARKUI_X_PLUGIN,
  GLOBAL_THIS_REQUIRE_NATIVE_MODULE,
  GLOBAL_THIS_REQUIRE_NAPI
} from '../../pre_define';
import {
  systemModules,
  projectConfig,
  sdkConfigs,
  sdkConfigPrefix,
  extendSdkConfigs
} from '../../../main';

import {
  writeUseOSFiles,
  writeCollectionFile,
  getAllComponentsOrModules
} from '../../utils';

const filter: any = createFilter(/(?<!\.d)\.(ets|ts|js)$/);
const allFiles: Set<string> = new Set();

export const appImportModuleCollection: Map<string, Set<string>> = new Map();

export function apiTransform() {
  const useOSFiles: Set<string> = new Set();
  return {
    name: 'apiTransform',
    load(id: string) {
      allFiles.add(path.join(id));
    },
    transform(code: string, id: string) {
      const magicString = new MagicString(code);
      if (filter(id)) {
        if (projectConfig.compileMode === "esmodule") {
          code = processSystemApiAndLibso(code, id, useOSFiles);
        } else {
          code = processSystemApi(code, id);
          code = processLibso(code, id, useOSFiles);
        }
      }
      return {
        code: code,
        map: magicString.generateMap({ hires: true })
      };
    },
    beforeBuildEnd() {
      this.share.allComponents = getAllComponentsOrModules(allFiles, 'component_collection.json');
      this.share.allFiles = allFiles;
    },
    buildEnd() {
      if (projectConfig.isPreview && projectConfig.aceSoPath &&
        useOSFiles && useOSFiles.size > 0) {
        writeUseOSFiles(useOSFiles);
      }
      if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
        const allModules: Map<string, Array<string>> = getAllComponentsOrModules(allFiles, 'module_collection.json');
        writeCollectionFile(projectConfig.cachePath, appImportModuleCollection, allModules, 'module_collection.json');
      }
    }
  };
}


function processSystemApi(content: string, sourcePath: string): string {
  // 'arkui-x' represents cross platform related APIs, processed as 'ohos'
  const REG_SYSTEM: RegExp =
    new RegExp(`import\\s+(.+)\\s+from\\s+['"]@(${sdkConfigPrefix})\\.(\\S+)['"]|import\\s+(.+)\\s*=\\s*require\\(\\s*['"]@(${sdkConfigPrefix})\\.(\\S+)['"]\\s*\\)`, 'g');
  appImportModuleCollection.set(path.join(sourcePath), new Set());
  return content.replace(REG_SYSTEM, (item, item1, item2, item3, item4, item5, item6) => {
    const moduleType: string = item2 || item5;
    const systemKey: string = item3 || item6;
    const systemValue: string = item1 || item4;
    const systemModule: string = `${moduleType}.${systemKey}`;
    appImportModuleCollection.get(path.join(sourcePath)).add(systemModule);
    checkModuleExist(systemModule, sourcePath);
    const externalModuleParam: string = isExtendModuleType(moduleType) &&
      moduleType !== ARKUI_X_PLUGIN ? `, false, '', '${moduleType}'` : ``;
    if (NATIVE_MODULE.has(systemModule)) {
      item = `var ${systemValue} = ${GLOBAL_THIS_REQUIRE_NATIVE_MODULE}('${moduleType}.${systemKey}')`;
    } else if (checkModuleType(moduleType)) {
      item = `var ${systemValue} = ${GLOBAL_THIS_REQUIRE_NAPI}('${systemKey}'${externalModuleParam})`;
    }
    return item;
  });
}

interface SdkConfig {
  apiPath: string;
  prefix: string;
}

function isExtendModuleType(moduleType: string): boolean {
  for (let i = 0; i < extendSdkConfigs.length; i++) {
    const config: SdkConfig = extendSdkConfigs[i];
    if (config.prefix === `@${moduleType}`) {
      return true;
    }
  }
  return false;
}

function checkModuleType(moduleType: string): boolean {
  for (let i = 0; i < sdkConfigs.length; i++) {
    const config = sdkConfigs[i];
    if (config.prefix === `@${moduleType}`) {
      return true;
    }
  }
  return false;
}

function checkModuleExist(systemModule: string, sourcePath: string): void {
  const module: string = `@${systemModule.trim()}.d.ts`;
  if (/\.js$/.test(sourcePath) && !systemModules.includes(module)) {
    const message: string =
      `Cannot find module '${module}' or its corresponding type declarations.`;
    console.error(`BUILDERROR File: ${sourcePath}\n ${message}`);
  }
}

function processLibso(content: string, sourcePath: string, useOSFiles: Set<string>): string {
  const REG_LIB_SO: RegExp =
    /import\s+(.+)\s+from\s+['"]lib(\S+)\.so['"]|import\s+(.+)\s*=\s*require\(\s*['"]lib(\S+)\.so['"]\s*\)/g;
  return content.replace(REG_LIB_SO, (_, item1, item2, item3, item4) => {
    useOSFiles.add(sourcePath);
    const libSoValue: string = item1 || item3;
    const libSoKey: string = item2 || item4;
    return projectConfig.bundleName && projectConfig.moduleName
      ? `var ${libSoValue} = globalThis.requireNapi("${libSoKey}", true, "${projectConfig.bundleName}/${projectConfig.moduleName}");`
      : `var ${libSoValue} = globalThis.requireNapi("${libSoKey}", true);`;
  });
}

// It is rare to use `import xxx = require('module')` for system module and user native library,
// Here keep tackling with this for compatibility concern.
function processSystemApiAndLibso(content: string, sourcePath: string, useOSFiles: Set<string>): string {
  // 'arkui-x' represents cross platform related APIs, processed as 'ohos'
  const REG_REQUIRE_SYSTEM: RegExp = new RegExp(`import\\s+(.+)\\s*=\\s*require\\(\\s*['"]@(${sdkConfigPrefix})\\.(\\S+)['"]\\s*\\)`, 'g');
  // Import libso should be recored in useOSFiles.
  const REG_LIB_SO: RegExp =
    /import\s+(.+)\s+from\s+['"]lib(\S+)\.so['"]|import\s+(.+)\s*=\s*require\(\s*['"]lib(\S+)\.so['"]\s*\)/g;
  // 'arkui-x' represents cross platform related APIs, processed as 'ohos'
  const REG_IMPORT_SYSTEM = new RegExp(`import\\s+(.+)\\s+from\\s+['"]@(${sdkConfigPrefix})\\.(\\S+)['"]`, 'g');
  appImportModuleCollection.set(path.join(sourcePath), new Set());
  content.replace(REG_IMPORT_SYSTEM, (_, item1, item2, item3, item4, item5, item6) => {
    const moduleType: string = item2 || item5;
    const systemKey: string = item3 || item6;
    const systemValue: string = item1 || item4;
    const systemModule: string = `${moduleType}.${systemKey}`;
    appImportModuleCollection.get(path.join(sourcePath)).add(systemModule);
    return _;
  });
  return content.replace(REG_REQUIRE_SYSTEM, (_, item1, item2, item3, item4, item5, item6) => {
    const moduleType: string = item2 || item5;
    const systemKey: string = item3 || item6;
    const systemValue: string = item1 || item4;
    const systemModule: string = `${moduleType}.${systemKey}`;
    appImportModuleCollection.get(path.join(sourcePath)).add(systemModule);
    checkModuleExist(systemModule, sourcePath);
    return `import ${systemValue} from '@${moduleType}.${systemKey}'`;
  }).replace(REG_LIB_SO, (_, item1, item2, item3, item4) => {
    useOSFiles.add(sourcePath);
    const libSoValue: string = item1 || item3;
    const libSoKey: string = item2 || item4;
    return `import ${libSoValue} from 'lib${libSoKey}.so'`;
  });
}