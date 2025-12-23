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

// Expected: Each component 'id' value must be unique within the same build block; no two components are allowed to 
// share the same id string.
// Actual: Inside nested blocks, the id "label" is assigned to two 'Text' components, and the id "saveBtn" is assigned 
// to two 'Button' components, resulting in duplicated component ids within the same build structure.

@Entry
@Component
struct Demo2 {
  @State name: string = "User";

  build() {
    Column() {
      Text("User").id("block")

      Column() {
        Text("Name").id("label")
        Text(this.name).id("label") 
      }

      Row() {
        Button("Save").id("saveBtn")
        Button("Backup").id("saveBtn")
      }

      Text("End").id("endText")
    }
  }
}