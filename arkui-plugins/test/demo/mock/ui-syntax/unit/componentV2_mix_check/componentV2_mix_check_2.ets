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

import { Entry, Reusable, ReusableV2, ComponentV2 } from '@ohos.arkui.component';

// Expected: A struct defined with '@ComponentV2' must not use the conflicting '@Reusable' (V1) decorator.
// Actual: The struct 'V21' uses '@Reusable' along with '@ComponentV2', which is a forbidden mix of V1/V2 decorators.

@Reusable
@ReusableV2
@ComponentV2
@Entry
struct V21 {
  build() {
  }
}