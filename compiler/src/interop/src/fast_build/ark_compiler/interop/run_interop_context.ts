/*
 * Copyright (c) 2025-2026 Huawei Device Co., Ltd.
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

import { FileManager } from './interop_manager';
import { mkdirsSync, toUnixPath } from '../../../utils';
import {
  ArkTSEvolutionModule,
  BuildType,
  DeclFilesConfig,
  Params
} from './type';
import fs from 'fs';
import path from 'path';
import { EXTNAME_D_ETS } from '../common/ark_define';

export function run(param: Params): boolean {
  FileManager.init(param.dependentModuleMap, param.projectConfig.sdkAliasMap);
  InteropContext.init();
  param.tasks.forEach((task) => {
    const moduleInfo = FileManager.arkTSModuleMap.get(task.packageName);
    if (!moduleInfo || moduleInfo.dynamicFiles.length <= 0) {
      return;
    }
    if (task.buildTask === BuildType.INTEROP_CONTEXT && task.mainModuleName) {
      InteropContext.getInstance().writeDeclFileInfo(moduleInfo, task.mainModuleName);
    } else if (task.buildTask === BuildType.BYTE_CODE_HAR) {
      //todo
    }
  });
  FileManager.cleanFileManagerObject();
  return true;
}

export class InteropContext {
  private static instance: InteropContext;
  private pkgDeclFilesConfig: { [pkgName: string]: DeclFilesConfig } = {};

  static init(): void {
    InteropContext.instance = new InteropContext();
  }
  static getInstance(): InteropContext {
    if (!this.instance) {
      this.instance = new InteropContext();
    }
    return this.instance;
  }

  writeDeclFileInfo(moduleInfo: ArkTSEvolutionModule, mainModuleName: string): void {
    moduleInfo.isNative = moduleInfo.isNative ?? moduleInfo.packageName.endsWith('.so');
    moduleInfo.dynamicFiles.forEach((file) => {
      this.addDeclFilesConfig(file, moduleInfo);
    });

    if (!moduleInfo.declFilesPath) {
      throw new Error(`Decl files path is not defined for module ${moduleInfo.packageName}`);
    }

    const declFilesConfigFile: string = toUnixPath(moduleInfo.declFilesPath);
    mkdirsSync(path.dirname(declFilesConfigFile));
    if (this.pkgDeclFilesConfig[moduleInfo.packageName]) {
      fs.writeFileSync(
        declFilesConfigFile,
        JSON.stringify(this.pkgDeclFilesConfig[moduleInfo.packageName], null, 2),
        'utf-8'
      );
    }
  }

  getDeclgenV2OutPath(pkgName: string): string {
    if (FileManager.arkTSModuleMap.size && FileManager.arkTSModuleMap.get(pkgName)) {
      const arkTsModuleInfo: ArkTSEvolutionModule | undefined = FileManager.arkTSModuleMap.get(pkgName);
      if (!arkTsModuleInfo) {
        throw new Error(`Module info not found for package ${pkgName}`);
      }
      if (!arkTsModuleInfo.declgenV2OutPath) {
        throw new Error(`Declgen V2 output path is not defined for module ${pkgName}`);
      }
      return arkTsModuleInfo.declgenV2OutPath;
    }
    return '';
  }

  addDeclFilesConfig(filePath: string, moduleInfo: ArkTSEvolutionModule): void {
    const projectFilePath = getRelativePath(filePath, moduleInfo.modulePath);

    const declgenV2OutPath: string = this.getDeclgenV2OutPath(moduleInfo.packageName);
    if (!declgenV2OutPath) {
      return;
    }
    if (!this.pkgDeclFilesConfig[moduleInfo.packageName]) {
      this.pkgDeclFilesConfig[moduleInfo.packageName] = {
        packageName: moduleInfo.packageName,
        files: {}
      };
    }
    if (this.pkgDeclFilesConfig[moduleInfo.packageName].files[projectFilePath]) {
      return;
    }
    // The module name of the entry module of the project during the current compilation process.
    const normalizedFilePath: string = moduleInfo.isNative
      ? moduleInfo.moduleName
      : `${moduleInfo.packageName}/${projectFilePath}`;
    const declPath: string = path.join(toUnixPath(declgenV2OutPath), projectFilePath) + EXTNAME_D_ETS;
    const isNativeFlag = moduleInfo.isNative ? 'Y' : 'N';
    const ohmUrl: string = `${isNativeFlag}&&&${normalizedFilePath}&`;
    this.pkgDeclFilesConfig[moduleInfo.packageName].files[projectFilePath] = {
      declPath,
      filePath,
      ohmUrl: `@normalized:${ohmUrl}`
    };
  }

}

function getRelativePath(filePath: string, pkgPath: string): string {
  // rollup uses commonjs plugin to handle commonjs files,
  // the commonjs files are prefixed with '\x00' and need to be removed.
  if (filePath.startsWith('\x00')) {
    filePath = filePath.replace('\x00', '');
  }
  let unixFilePath: string = toUnixPath(filePath);

  // Handle .d.ets and .d.ts extensions
  const dEtsIndex = unixFilePath.lastIndexOf('.d.ets');
  const dTsIndex = unixFilePath.lastIndexOf('.d.ts');

  if (dEtsIndex !== -1) {
    unixFilePath = unixFilePath.substring(0, dEtsIndex);
  } else if (dTsIndex !== -1) {
    unixFilePath = unixFilePath.substring(0, dTsIndex);
  } else {
    // Fallback to regular extension removal if not a .d file
    const lastDotIndex = unixFilePath.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      unixFilePath = unixFilePath.substring(0, lastDotIndex);
    }
  }

  const projectFilePath: string = unixFilePath.replace(toUnixPath(pkgPath) + '/', '');
  return projectFilePath;
}
