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

import { Component, Column, Text, Entry } from '@ohos.arkui.component'
import { State } from "@ohos.arkui.stateManagement";

// Expected: A struct name must not match any built-in ArkUI attribute name; reserved attribute identifiers such as
// 'BorderWidth' cannot be used as custom struct names.
// Actual: This struct is declared with the name 'BorderWidth', which is a built-in attribute name, causing 
// a naming conflict with a reserved attribute.

@Entry
@Component
struct borderWidth {
  @State size: number = 5;
  build() {
    Column() {
      Text(`Size: ${this.size}`)
    }
  }
}