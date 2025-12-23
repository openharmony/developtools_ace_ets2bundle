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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { LocalStorageLink } from "@ohos.arkui.stateManagement";

// Expected: Properties decorated with '@LocalStorageLink' cannot be assigned to regular properties.
// Actual: 'storageVal' (@LocalStorageLink) is assigned to 'label' (regular).

@Component
struct ChildComp {
  label: string = '';

  build() {
    Text(this.label)
  }
}

@Entry( { storage: "__get_local_storage__" } )
@Component
struct LocalStorageMismatch {
  @LocalStorageLink('propA') storageVal: string = 'Init';

  build() {
    Column() {
      ChildComp({ label: this.storageVal });
    }
  }
}