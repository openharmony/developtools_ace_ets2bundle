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

import { Text, Column, Component, Builder } from "@ohos.arkui.component"
import { CustomDialog, CustomDialogController, CustomDialogControllerOptions } from "@kit.ArkUI"
import hilog from '@ohos.hilog'

@Builder function builder1(str: string) {}

@Builder function builder2() {}

@Component
struct CustomDialogUser {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: () => { builder1('nihao') },
  })

  build() {
    Column() {}
  }
}

@Component
struct CustomDialogUser2 {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: builder2,
  })

  build() {
    Column() {}
  }
}