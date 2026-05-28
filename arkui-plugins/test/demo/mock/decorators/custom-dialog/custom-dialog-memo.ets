/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { Component, Entry, CustomDialogController, CustomDialog } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

@Entry
@Component
struct MyStateSample {
  @State controller: CustomDialogController | null = new CustomDialogController({
    builder: customDialogExample({}),
    autoCancel: false,
    openAnimation: { duration: 5000, tempo: 0 },
    closeAnimation: { duration: 5000, tempo: 0 },
  })
  build() {
  }
}

@CustomDialog
@Component
struct customDialogExample {
  controller: CustomDialogController = new CustomDialogController({
    builder: ()=>{},
    autoCancel: false,
    openAnimation: { duration: 5000, tempo: 0 },
    closeAnimation: { duration: 5000, tempo: 0 },
  })
  build() {}
}