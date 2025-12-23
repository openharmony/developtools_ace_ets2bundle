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

import { Entry, Component, CustomDialog, ReusableV2 } from '@ohos.arkui.component';

// Expected: '@ReusableV2' can only be used with components decorated by '@ComponentV2'.
// Actual: Structs 'V23' and 'V24' use '@ReusableV2' but are decorated with '@Component' or
// '@CustomDialog', not '@ComponentV2'.

@ReusableV2
@Component
struct V23 {
  build() {
  }
}

@ReusableV2
@CustomDialog
struct V24 {
  controller?: CustomDialogController
  build() {
  }
}

@Component
@Entry
struct Demo2 {
  build() {
  }
}