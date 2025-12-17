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

import { Text, Column, Component, Entry, Button, ClickEvent } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"
import { CustomDialog, CustomDialogController } from "@ohos.arkui.component"

@Component
@CustomDialog
struct CustomDialogExample {
  aaController?: CustomDialogController;
  @State text: string = 'text';

  build() {
    Column() {
      Text('CustomDialog One')
        .fontSize(30)
        .height(100)
      Button('Close')
        .onClick((e: ClickEvent) => {
          if (this.aaController != undefined) {
            this.aaController!.close();
          }
        })
        .margin(20)
    }
  }
}

@Component
struct CustomDialogUser {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: CustomDialogExample(),
    autoCancel: true,
  })

  aboutToDisappear() {
    this.dialogController = null;
  }

  build() {
    Column() {
      Button('click me')
        .onClick((e: ClickEvent) => {
          if (this.dialogController != null) {
            this.dialogController!.open();
          }
        }).backgroundColor(0x317aff)
    }
  }
}