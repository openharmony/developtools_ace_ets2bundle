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

import { Component, ComponentV2, Column, Text, Entry } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: A '@ComponentV2' custom component must not use any child component decorated with '@Reusable' (v1). 
// Reusable v1 components are not allowed in the v2 component tree, so they must not be rendered inside '@ComponentV2'
// structs.
// Actual: The '@ComponentV2' struct 'MiniPanel' renders the child component 'MiniItem', which is decorated with 
// '@Reusable'. Because a v1 reusable component is used inside a v2 component, the rule reports: When a custom 
// component is decorated with @ComponentV2 and contains a child component decorated with @Reusable,
// the child component will not create.

@Entry
@Reusable
@Component
struct MiniItem {
  build() {
    Text("Mini")
  }
}

@ComponentV2
struct MiniPanel {
  value: number = 10;

  build() {
    Column() {
      Text(`${this.value}`)
      MiniItem()
    }
  }
}