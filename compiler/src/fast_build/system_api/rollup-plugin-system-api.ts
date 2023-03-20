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

import {
  NATIVE_MODULE,
  SYSTEM_PLUGIN,
  OHOS_PLUGIN
} from '../../pre_define';
import {
  systemModules,
  projectConfig
} from '../../../main';
import { writeUseOSFiles } from '../../utils';

const filter: any = createFilter(/(?<!\.d)\.(ets|ts|js)$/);

export function apiTransform() {
  const useOSFiles: Set<string> = new Set();
  return {
    name: 'apiTransform',
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
    buildEnd() {
      if (projectConfig.isPreview && projectConfig.aceSoPath &&
        useOSFiles && useOSFiles.size > 0) {
        writeUseOSFiles(useOSFiles);
      }
    }
  };
}

function processSystemApi(content: string, sourcePath: string): string {
  const REG_SYSTEM: RegExp =
    /import\s+(.+)\s+from\s+['"]@(system|ohos)\.(\S+)['"]|import\s+(.+)\s*=\s*require\(\s*['"]@(system|ohos)\.(\S+)['"]\s*\)/g;
  return content.replace(REG_SYSTEM, (item, item1, item2, item3, item4, item5, item6) => {
    const moduleType: string = item2 || item5;
    const systemKey: string = item3 || item6;
    const systemValue: string = item1 || item4;
    const systemModule: string = `${moduleType}.${systemKey}`;
    checkModuleExist(systemModule, sourcePath);
    if (NATIVE_MODULE.has(systemModule)) {
      item = `var ${systemValue} = globalThis.requireNativeModule('${moduleType}.${systemKey}')`;
    } else if (moduleType === SYSTEM_PLUGIN || moduleType === OHOS_PLUGIN) {
      item = `var ${systemValue} = globalThis.requireNapi('${systemKey}')`;
    }
    return item;
  });
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
  const REG_SYSTEM: RegExp = /import\s+(.+)\s*=\s*require\(\s*['"]@(system|ohos)\.(\S+)['"]\s*\)/g;
  // Import libso should be recored in useOSFiles.
  const REG_LIB_SO: RegExp =
    /import\s+(.+)\s+from\s+['"]lib(\S+)\.so['"]|import\s+(.+)\s*=\s*require\(\s*['"]lib(\S+)\.so['"]\s*\)/g;

  return content.replace(REG_SYSTEM, (_, item1, item2, item3, item4, item5, item6) => {
    const moduleType: string = item2 || item5;
    const systemKey: string = item3 || item6;
    const systemValue: string = item1 || item4;
    const systemModule: string = `${moduleType}.${systemKey}`;
    checkModuleExist(systemModule, sourcePath);
    return `import ${systemValue} from '@${moduleType}.${systemKey}'`;
  }).replace(REG_LIB_SO, (_, item1, item2, item3, item4) => {
    useOSFiles.add(sourcePath);
    const libSoValue: string = item1 || item3;
    const libSoKey: string = item2 || item4;
    return `import ${libSoValue} from 'lib${libSoKey}.so'`;
  });
}