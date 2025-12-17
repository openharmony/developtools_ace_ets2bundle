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

import { Column, Text, Component, ComponentV2, Entry } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: A custom component decorated with '@ComponentV2' must not render any child component that is decorated 
// with '@Reusable' (v1). Reusable v1 components are not supported inside a v2 component tree, so this combination
// is considered invalid.
// Actual: This '@ComponentV2' struct renders a child component that is decorated with '@Reusable', so the child will 
// not be created at runtime and the rule reports: When a custom component is decorated with @ComponentV2 and contains
// a child component decorated with @Reusable, the child component will not create.

@Entry
@Reusable
@Component
struct ChildA {
  build() {
    Text("ChildA")
  }
}

@ComponentV2
struct ParentA {
  num: number = 1;

  build() {
    Column() {
      Text(`${this.num}`)
      ChildA()
    }
  }
}