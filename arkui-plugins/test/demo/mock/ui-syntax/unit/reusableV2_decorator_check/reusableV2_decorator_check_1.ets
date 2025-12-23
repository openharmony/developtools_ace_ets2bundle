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

import { Entry, Component, ComponentV2, ReusableV2, Reusable } from '@ohos.arkui.component';

// Expected: A struct cannot have both '@Reusable' and '@ReusableV2'; '@ReusableV2' requires '@ComponentV2'.
// Actual: Structs 'V11' and 'V21' have both '@Reusable' and '@ReusableV2'; '@ReusableV2' used without '@ComponentV2'.

@Reusable
@ReusableV2
@Component
struct V11 {
  build() {
  }
}

@Reusable
@ReusableV2
@Component
struct V21 {
  build() {
  }
}

@ComponentV2
@Entry
struct V22 {
  build() {
  }
}