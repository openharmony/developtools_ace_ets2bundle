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

import { Entry, ComponentV2 } from '@ohos.arkui.component';
import { Once } from "@ohos.arkui.stateManagement";

// Expected: '@Once' may only decorate struct member properties; using it on top-level
// functions or variables is invalid.
// Actual: Both 'globalOnceFunction' and 'globalOnceValue' wrongly use '@Once' at top-level.

@Once
function globalOnceFunction() {
}

@Once
let globalOnceValue: string = "hello";

@Entry
@ComponentV2
struct TestComponent {
  build() {}
}
