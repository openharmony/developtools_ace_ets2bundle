/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

class Meta {
  hostModulesInfo: Array<any>;
  moduleName: string;
  isLocalDependency: boolean;
  isNodeEntryFile: boolean;
  pkgPath: string;

  constructor(entryModuleName: string, modulePath: string) {
    this.hostModulesInfo = [];
    this.moduleName = entryModuleName;
    this.isLocalDependency = true;
    this.isNodeEntryFile = false;
    this.pkgPath = modulePath;
  }
};

class ModuleInfo {
  meta: Meta;
  id: string;
  importedIdMaps: object = {};

  constructor(id: string, entryModuleName: string, modulePath: string) {
    this.meta = new Meta(entryModuleName, modulePath);
    this.id = id;
  }
  setIsLocalDependency(value: boolean) {
    this.meta.isLocalDependency = value
  }
  setIsNodeEntryFile(value: boolean) {
    this.meta.isNodeEntryFile = value
  }
}

export default ModuleInfo
