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

import { Entry, Component, ComponentV2, CustomDialog, Reusable, Column } from '@ohos.arkui.component';

// Expected: Structs decorated with '@ComponentV2' cannot also have the '@Component' decorator.
// Actual: 'ComponentV2BothWithComponent' has both '@ComponentV2' and '@Component', violating the exclusive rule.

@Entry
@ComponentV2
@Component
struct ComponentV2BothWithComponent {
  build() {
    Column() {}
  }
}

// Expected: '@ComponentV2' cannot be combined with '@CustomDialog' in the same struct definition.
// Actual: 'ComponentV2BothWithComponent1' is decorated with both, which is a forbidden mix of component types.

@ComponentV2
@CustomDialog
struct ComponentV2BothWithComponent1 {
  build() {
    Column() {}
  }
}

// Expected: The '@ComponentV2' decorator must not be used with the V1 '@Reusable' decorator on the same struct.
// Actual: 'ComponentV2BothWithComponent2' combines '@ComponentV2' and '@Reusable', causing a validation failure.

@ComponentV2
@Reusable
struct ComponentV2BothWithComponent2 {
  build() {
    Column() {}
  }
}