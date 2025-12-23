/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { LocalStorageLink, StorageProp, StorageLink} from "@ohos.arkui.stateManagement";

// Expected: Properties decorated with @StorageProp, @StorageLink, or @LocalStorageLink must not be declared as public.
// Actual: 'storageProp', 'storageLink', and 'localStorageLink' are declared public, violating modifier rules.

@Entry
@Component
struct InvalidPublicDecorators {
  @StorageProp('test') public storageProp: string = 'test';
  @StorageLink('test') public storageLink: string = 'test';
  @LocalStorageLink('test') public localStorageLink: string = 'test';

  build() {
    Column() {
      Text(this.storageProp)
    }
  }
}