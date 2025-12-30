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

import { Entry, Component, Row } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: Built-in annotations (e.g., @State, @Link, @Prop) cannot be applied to a static variable.
// Actual: The static variable 'message' was declared with a built-in annotation '@State'.

@Entry
@Component
struct ValidateDecoratorsIndex {
  @State  static message: string = 'Hello';
  build() {
    Row() {}
  }
}