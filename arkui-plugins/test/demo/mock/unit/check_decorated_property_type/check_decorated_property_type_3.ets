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

import { Component, Column, CustomDialogController } from '@ohos.arkui.component';
import { Link } from "@ohos.arkui.stateManagement";

// Expected: For property type validation, the '@Link' decorator must not be applied to
// the 'CustomDialogController' type.
// Actual: The 'dialogCtrl' property uses 'CustomDialogController', violating the forbidden type restriction for links.

@Component
struct DialogFailCase {
  @Link dialogCtrl: CustomDialogController;

  build() {
    Column()
  }
}