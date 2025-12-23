/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Component, ObservedV2, Column, Text } from '@ohos.arkui.component';
import { LocalStorageLink, StorageLink } from "@ohos.arkui.stateManagement";

// Expected: V1 decorators (@StorageLink, @LocalStorageLink) must not be used with '@ObservedV2' types in this case.
// Actual: Properties 'appConfig' and 'localConfig' use 'GlobalConfig' (@ObservedV2), violating the mixed-use rule.

@ObservedV2
class GlobalConfig {
  apiUrl: string = "https://api.example.com";
  timeout: number = 5000;
}

@Component
struct SettingsPanel {
  @StorageLink('config') appConfig: GlobalConfig = new GlobalConfig();
  @LocalStorageLink('localConf') localConfig: GlobalConfig = new GlobalConfig();

  build() {
    Column() {
      Text(this.appConfig.apiUrl)
    }
  }
}