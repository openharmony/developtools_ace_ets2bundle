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

import Cache from "./cache";
import Share from "./share";
import ModuleInfo from "./module_info";
import {
  SDK_VERSION,
  BUNDLE_NAME_DEFAULT,
  ETS_LOADER_VERSION,
  RUNTIME_OS_OPENHARMONY,
  MODULE_NAME_HASH_DEFAULT
} from "./common";
import { DEFAULT_PROJECT, MODULE_ID_ROLLUP_PLACEHOLDER, NODE_MODULES_PATH } from "./path_config";
import { scanFiles } from "../../utils/path_utils";
import { IArkProjectConfig } from "./project_config";
import { ESMODULE, RELEASE, DEBUG } from "../../../../lib/fast_build/ark_compiler/common/ark_define";
import {
  ARK_COMPILER_META_INFO,
  IS_CACHE_INVALID
} from '../../../../lib/fast_build/ark_compiler/common/ark_define';

class RollUpPluginMock {
  cache: Cache;
  meta: any = { rollupVersion: '3.10.0', watchMode: false };
  moduleIds: any;
  share: Share;
  moduleInfos: Array<ModuleInfo>;

  private isPreview: boolean = false;

  constructor() {
    this.cache = new Cache();
  }

  public preConfig(buildMode: string = DEBUG) {
    this.share = new Share(buildMode);
  }

  public build(testcase: string = DEFAULT_PROJECT, buildMode: string = DEBUG) {
    this.isPreview = false;
    this.share = new Share(buildMode);

    this.share.projectConfig.setPreview(this.isPreview);
    this.meta.watchMode = this.isPreview;

    this.doBuild(testcase);
  }

  public preview(testcase: string = DEFAULT_PROJECT) {
    this.isPreview = true;
    this.share = new Share(DEBUG);

    this.share.projectConfig.setPreview(this.isPreview);
    this.meta.watchMode = this.isPreview;

    this.doBuild(testcase);
  }

  public hotReload(testcase: string = DEFAULT_PROJECT) {
    this.isPreview = false;
    this.share = new Share(DEBUG);

    this.share.projectConfig.setPreview(this.isPreview);
    this.meta.watchMode = this.isPreview;

    this.doBuild(testcase);
  }

  private doBuild(testcase: string) {
    this.share.scan(testcase);
    this.load();

    // mock ets-loader build start
    this.share.arkProjectConfig = this.mockArkProjectConfig();
    this.mockCheckArkCompilerCacheInfo();
  }

  private mockArkProjectConfig(): IArkProjectConfig {
    const mode = this.isPreview ? '.preview' : 'build';
    const projectRootDir = this.share.projectConfig.projectTopDir;
    const entryName = this.share.projectConfig.entryModuleName;

    return {
      projectRootPath: projectRootDir,
      modulePathMap: { entry: `${projectRootDir}/${entryName}` },
      isOhosTest: undefined,
      processTs: false,
      pandaMode: undefined,
      nodeModulesPath: `${projectRootDir}/${entryName}/${mode}/${NODE_MODULES_PATH}`,
      harNameOhmMap: {},
      minPlatformVersion: SDK_VERSION,
      moduleName: `${entryName}`,
      bundleName: BUNDLE_NAME_DEFAULT,
      hotReload: undefined,
      patchAbcPath: undefined,
      changedFileList: undefined,
      compileMode: ESMODULE
    }
  }

  private mockCheckArkCompilerCacheInfo(): void {
    const metaInfos = [
      SDK_VERSION, SDK_VERSION, RUNTIME_OS_OPENHARMONY, `/OpenHarmony/Sdk/${SDK_VERSION}/ets/build-tools/app`,
      ETS_LOADER_VERSION, RELEASE, BUNDLE_NAME_DEFAULT,
      MODULE_NAME_HASH_DEFAULT, 'null_aotCompileMode', 'null_apPath'
    ]
    const metaInfo = metaInfos.join(':');
    this.cache.set(IS_CACHE_INVALID, true);
    this.cache.set(ARK_COMPILER_META_INFO, metaInfo);
  }

  public addWatchFile() { }

  public async(func: Function) {
    if (func) {
      func();
    }
  }

  public block() { }

  public emitFile() { }

  public error() { }

  public getFileName() { }

  public getModuleIds(): IterableIterator<string> {
    return this.share.allFiles ? this.share.allFiles.values() : undefined;
  }

  public getModuleInfo(id: string) {
    for (let i = 0; i < this.moduleInfos.length - 1; i++) {
      return this.moduleInfos.find(item => item.id === id);
    }
  }

  public getWatchFiles() { }

  public load() {
    // load project files list
    this.share.allFiles = new Set<string>();
    scanFiles(this.share.projectConfig.projectPath, this.share.allFiles);
    this.share.allFiles.add(MODULE_ID_ROLLUP_PLACEHOLDER);

    // load all files module info
    const allFiles = Array.from(this.share.allFiles);
    this.moduleInfos = new Array<ModuleInfo>();
    for (let i = 0; i < allFiles.length - 1; i++) {
      this.moduleInfos.push(new ModuleInfo(allFiles[i],
        this.share.projectConfig.entryModuleName,
        this.share.projectConfig.modulePath));
    }
  }

  public parse() { }

  public resolve() { }

  public setAssetSource() { }

  public signal() { }

  public warn() { }
}

export default RollUpPluginMock;
