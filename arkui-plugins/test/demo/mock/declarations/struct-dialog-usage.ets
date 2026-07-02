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

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component"
import { State, Local, Computed, Monitor } from "@ohos.arkui.stateManagement"
import { ExportCustomDialog, ExportCustomDialogWithBody } from "./utils/struct-dialog"

@Builder
function aBuilder(): void {
  ExportCustomDialogWithBody({ controller: null });
}

@Component
struct MyStateSample {
  @State aNumber: number = 1;
  controller: CustomDialogController | null = new CustomDialogController({
    builder: ExportCustomDialog({ someLink: this.aNumber })
  })

  build() {
    Column() {
      ExportCustomDialog({ someLink: this.aNumber });
      ExportCustomDialogWithBody({ controller: this.controller });
    }
  }
}