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

import { Entry, Component, ReusableV2, Preview } from '@ohos.arkui.component';

// Expected: The analyzer should report that struct 'V22'&'V23'&'V25' uses '@ReusableV2' but is missing
// one of the required annotations: '@Component', '@ComponentV2', or '@CustomDialog'.
// Actual: Annotation '@Component', '@ComponentV2', or '@CustomDialog' is missing for struct 'V22'&'V23'&'V25'.

@ReusableV2
@Entry
struct V22 {
  build() {
  }
}

@ReusableV2
struct V23 {
  build() {
  }
}

@Preview
@ReusableV2
struct V25 {
  build() {
  }
}
