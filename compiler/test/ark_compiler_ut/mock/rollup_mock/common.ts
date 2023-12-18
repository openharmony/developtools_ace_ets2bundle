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

export const SDK_VERSION: number = 10;
export const SDK_VERSION_MOCK: number = 1;
export const ETS_LOADER_VERSION: string = '4.1.2.3';

export const BUNDLE_NAME_DEFAULT: string = 'com.example.app';
export const ENTRY_MODULE_NAME_DEFAULT: string = 'entry';

export const RUNTIME_OS_OPENHARMONY: string = 'OpenHarmony';
export const MODULE_NAME_HASH_DEFAULT: string = '1043bfc77febe75fafec0c4309faccf1';
export const RESOURCE_TABLE_HASH_DEFAULT: string = '790527e39c8c2be7fbbc762f7966104e';
export const DEVICE_TYPE: string = 'default,tablet';

export const NODE_JS_PATH: string = '/usr/local/nodejs';
export const PORT_DEFAULT: string = '29900';

export const CMD_DEBUG_INFO: string = '--debug-info';
export const NODE: string = 'node';
export const META: string = 'meta';

export const ENTRYABILITY_TS_PATH_DEFAULT: string = '/src/main/ets/entryability/EntryAbility.ts';
export const ENTRYABILITY_JS_PATH_DEFAULT: string = '/src/main/ets/entryability/EntryAbility.js';
export const INDEX_ETS_PATH_DEFAULT: string = '/src/main/ets/pages/Index.ets';

export const ENTRYABILITY_TS_RECORDNAME: string = '/entry/ets/entryability/EntryAbility';
export const ENTRYABILITY_JS_RECORDNAME: string = '/entry/ets/entryability/EntryAbility';
export const INDEX_ETS_RECORDNAME: string = '/entry/ets/pages/Index';
export const EXTNAME_MAP: string = '.map';

export const ENTRYABILITY_TS_PATH: string = '/entryability/EntryAbility.ts';
export const INDEX_ETS_PATH: string = '/pages/Index.ets';
export const ENTRYABILITY_TS: string = 'EntryAbility.ts';
export const INDEX_ETS: string = 'Index.ets';
export const OH_UIABILITY: string = '@ohos:app.ability.UIAbility';
export const OH_HILOG: string = '@ohos:hilog';
export const OHURL_RES: string = '@bundle:com.example.app/entry/ets/pages/Index';
export const OHURL_SHAREDLIBRARY: string = "@bundle:UtTestApplication/sharedLibrary/ets/index"

export const FILE: string = 'file';
export const SOURCE: string = 'sources';
export const DYNAMICIMPORT_ETS: string = 'DynamicImport.ets';

export const PKG_MODULES: string = 'pkg_modules';
export const DEBUG: string = 'debug';
export const EXPOSE_GC: string = 'expose-gc';
export const JSONSTRING: string = `{"mCompact":false,"mDisableHilog":false,"mDisableConsole":false,"mSimplify":false,"mTopLevel":false,"mNameObfuscation":{"mEnable":true,"mNameGeneratorType":1,"mReservedNames":[],"mRenameProperties":false,"mReservedProperties":[],"mKeepStringProperty":true},"mEnableSourceMap":true,"mEnableNameCache":true}`;
export const MODULES: string = 'oh-modules';
export const LOADER_AOTMODE: string = 'loader_aotMode.json';
export const UPDATESOURCEMAP: string = 'updateSourceMap.json';
export const ETS: string = "\"/**\\n * Copyright (c)'@ohos:app.ability.UIAbility'\\n * Licensed under t'@ohos:hilog'ense, Version 2.0 (the \\\"License\\\");\\n * you may not use this file except in compliance with the License.\\n * You may obtain a copy of the License at\\n *\\n *     http://www.apache.org/licenses/LICENSE-2.0\\n *\\n * Unless required by applicable law or agreed to in writing, software\\n * distributed under the License is distributed on an \\\"AS IS\\\" BASIS,\\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\\n * See the License for the specific language governing permissions and\\n * limitations under the License.\\n */\\n@Entry\\n@Component\\nstruct Index {\\n  @State message: string = 'Hello World'\\n\\n  build() {\\n    Row() {\\n      Column() {\\n        Text(this.message)\\n          .fontSize(50)\\n          .fontWeight(FontWeight.Bold)\\n      }\\n      .width('100%')\\n    }\\n    .height('100%')\\n  }\\n}\"";
export const TS: string = "\"/**\\r\\n * Copyright ('@ohos:app.ability.UIAbility'd.\\r\\n * Licensed und'@ohos:hilog' License, Version 2.0 (the \\\"License\\\");\\r\\n * you may not use this file except in compliance with the License.\\r\\n * You may obtain a copy of the License at\\r\\n *\\r\\n *     http://www.apache.org/licenses/LICENSE-2.0\\r\\n *\\r\\n * Unless required by applicable law or agreed to in writing, software\\r\\n * distributed under the License is distributed on an \\\"AS IS\\\" BASIS,\\r\\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\\r\\n * See the License for the specific language governing permissions and\\r\\n * limitations under the License.\\r\\n */\\r\\nimport UIAbility from '@ohos.app.ability.UIAbility';\\r\\nimport hilog from '@ohos.hilog';\\r\\nimport window from '@ohos.window';\\r\\n\\r\\nexport default class EntryAbility extends UIAbility {\\r\\n  onCreate(want, launchParam) {\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');\\r\\n  }\\r\\n\\r\\n  onDestroy() {\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');\\r\\n  }\\r\\n\\r\\n  onWindowStageCreate(windowStage: window.WindowStage) {\\r\\n    // Main window is created, set main page for this ability\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageCreate');\\r\\n\\r\\n    windowStage.loadContent('pages/Index', (err, data) => {\\r\\n      if (err.code) {\\r\\n        hilog.error(0x0000, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');\\r\\n        return;\\r\\n      }\\r\\n      hilog.info(0x0000, 'testTag', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');\\r\\n    });\\r\\n  }\\r\\n\\r\\n  onWindowStageDestroy() {\\r\\n    // Main window is destroyed, release UI related resources\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');\\r\\n  }\\r\\n\\r\\n  onForeground() {\\r\\n    // Ability has brought to foreground\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onForeground');\\r\\n  }\\r\\n\\r\\n  onBackground() {\\r\\n    // Ability has back to background\\r\\n    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onBackground');\\r\\n  }\\r\\n}\\r\\n\"";