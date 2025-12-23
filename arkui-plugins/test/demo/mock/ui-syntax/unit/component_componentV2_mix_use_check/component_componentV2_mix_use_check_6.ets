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

import { Entry, Component, ObservedV2, Column, Button } from '@ohos.arkui.component';
import { State, Link } from "@ohos.arkui.stateManagement";

// Expected: Validation should report two separate errors for mixing V1 decorators with V2 types in the same component.
// Actual: Both 'localData' (@State) and 'linkedData' (@Link) are typed as 'SharedModel' (@ObservedV2).

@ObservedV2
class SharedModel {
  count: number = 0;
}

@Entry
@Component
struct MultipleErrorsTest {
  @State localData: SharedModel = new SharedModel();
  @Link linkedData: SharedModel;

  build() {
    Column() {
      Button(`Local: ${this.localData.count}`)
        .onClick(() => this.localData.count++)
      
      Button(`Linked: ${this.linkedData.count}`)
        .onClick(() => this.linkedData.count++)
    }
  }
}