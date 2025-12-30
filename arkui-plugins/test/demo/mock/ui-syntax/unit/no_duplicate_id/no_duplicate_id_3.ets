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

import { Entry, Component, Column, Text, Row, Button } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: All component 'id' values within the same build block must be unique; duplicate id strings may not be 
// assigned to multiple components.
// Actual: The id "header" is used for two separate 'Text' components, and the id "action" is used for two different 
// 'Button' components in the same block, resulting in duplicated component ids.

@Entry
@Component
struct Demo3 {
  @State counter: number = 0;

  build() {
    Column() {
      Text("Header").id("header")
      Text("Header Copy").id("header")

      Row() {
        Button("Confirm").id("action")
        Button("Cancel").id("action")
      }

      Column() {
        Text("Bottom Text").id("bottom")
      }
    }
  }
}

