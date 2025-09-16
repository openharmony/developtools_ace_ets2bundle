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
import { State, Link, Prop } from "@ohos.arkui.stateManagement"
import {
  CustomDialog,
  CustomDialogController,
  DismissDialogAction,
  DismissReason,
  DialogAlignment,
  CustomDialogControllerOptions
} from "@ohos.arkui.component"
import hilog from '@ohos.hilog'

@CustomDialog
struct CustomDialogExample {
  aaController?: CustomDialogController;
  @State text: string = 'text';
  cancel: () => void = () => {
  }
  confirm: () => void = () => {
  }
  @State  hh: string = 'nihao'
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
    builder: CustomDialogExample({
      cancel: ()=> { this.onCancel(); },
      confirm: ()=> { this.onAccept(); }
    }),
    cancel: this.existApp,
    autoCancel: true,
    alignment: DialogAlignment.Center,
    offset: { dx: 0, dy: -20 },
    gridCount: 4,
    showInSubWindow: true,
    isModal: true,
    customStyle: false,
    cornerRadius: 10,
    focusable: true
  })

  aboutToDisappear() {
    this.dialogController = null;
  }

  onCancel() {
    console.info('Callback when the first button is clicked');
  }

  onAccept() {
    console.info('Callback when the second button is clicked');
  }

  existApp() {
    console.info('Click the callback in the blank area');
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