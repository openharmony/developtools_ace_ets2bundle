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

import { Entry, Component, Row, Column, Text, DialogAlignment, CustomDialogController } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: In this property type validation, the '@State' decorator must not be used
// with the 'CustomDialogController' type.
// Actual: The 'message' property is declared as 'CustomDialogController', violating the type restriction
// for state variables.

@Entry
@Component
struct ValidateForbiddenUseStateTypeIndex {
  @State message: CustomDialogController = new CustomDialogController({
    builder: CustomDialogExampleTwo(),
    alignment: DialogAlignment.Bottom,
    offset: { dx: 0, dy: -25 } })
  build() {
    Row() {}
  }
}

@CustomDialog
struct CustomDialogExampleTwo {
  controllerTwo?: CustomDialogController
  build() {
    Column() {
      Text('我是第二个弹窗')
        .fontSize(30)
        .height(100)
    }
  }
}