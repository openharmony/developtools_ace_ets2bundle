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

import { Entry, Component, Column, Text, BuilderParam } from '@ohos.arkui.component';
import { State } from '@ohos.arkui.stateManagement';

// Expected: The 'AmbiguousBox' component has 2 @BuilderParam properties.
// Actual: Even when nested inside an 'if' statement, the trailing lambda usage must trigger the validation error.

@Component
struct AmbiguousBox {
  @BuilderParam slotA: () => void;
  @BuilderParam slotB: () => void;

  build() {
    Column() {
      this.slotA()
      this.slotB()
    }
  }
}

@Entry
@Component
struct NestedScopeTest {
  @State showBox: boolean = true;

  build() {
    Column() {
      if (this.showBox) {
        AmbiguousBox() {
          Text("Which slot am I for?")
        }
      }
    }
  }
}