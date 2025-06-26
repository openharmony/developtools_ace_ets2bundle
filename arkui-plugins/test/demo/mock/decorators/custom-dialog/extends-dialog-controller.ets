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
import { CustomDialog, CustomDialogController, CustomDialogControllerOptions } from "@kit.ArkUI"

@CustomDialog
struct CustomDialogExample {
  aaController?: CustomDialogController;

  build() {
    Column() {}
  }
}

class DialogControllerV2 extends CustomDialogController {
  options: CustomDialogControllerOptions;
  
  constructor(options: CustomDialogControllerOptions) {
    super(options);
    this.options = options;
  }
}

class DialogControllerV3 extends DialogControllerV2 {
  options: CustomDialogControllerOptions;
  
  constructor(options: CustomDialogControllerOptions) {
    super(options);
    this.options = options;
  }
}

@Component
struct CustomDialogUser {
  dialogController: CustomDialogController | null = new CustomDialogController({
    gridCount: 4,
    showInSubWindow: true,
    builder: CustomDialogExample(),
  } as CustomDialogControllerOptions) as DialogControllerV3

  build() {
    Column() {
      Button('click me')
        .onClick((e: ClickEvent) => {
          if (this.dialogController != null) {
            this.dialogController!.open();
          }
        })
    }
  }
}