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

import { State } from "@ohos.arkui.stateManagement"
import { CustomDialog, CustomDialogController, ComponentV2, Component, Builder } from "@ohos.arkui.component"

@CustomDialog
export declare struct CustomDialogExample {
  aaController?: CustomDialogController;
  @State text: string;
  hh: string

  @Builder build(): void;
}

@Component
struct CustomDialogUserV1 {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: CustomDialogExample(),
  })

  build() {}
}

@ComponentV2
struct CustomDialogUserV2 {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: CustomDialogExample(),
  })

  build() {}
}