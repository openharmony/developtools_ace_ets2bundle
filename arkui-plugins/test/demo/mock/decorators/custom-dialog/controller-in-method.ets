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

import { Component, CustomDialog, CustomDialogController } from "@ohos.arkui.component"

@CustomDialog
struct CustomDialogExample {
  aaController?: CustomDialogController;
  build() {}
}

@Component
struct CustomDialogUser {
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: CustomDialogExample({}),
  });

  updateController1() {
    this.dialogController = new CustomDialogController({
      builder: CustomDialogExample({}),
      autoCancel: true,
    });
  }

  updateController2() {
    let temp = new CustomDialogController({
      builder: CustomDialogExample({}),
      autoCancel: true,
    });
    this.dialogController = temp;
  }

  build() {}
}