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

// Expected: Each component 'id' value within the same build block must be unique; the same string id cannot be 
// assigned to multiple components.
// Actual: In this example, the id "title" is used for two different 'Text' components and the id "btn" is used for 
// two different 'Button' components within the same build block, so the component ids are duplicated.

@Entry
@Component
struct Demo1 {
  @State a: number = 0;

  build() {
    Column() {
      Text("Title").id("title")
      Text("Subtitle").id("title") 

      Row() {
        Button("Click").id("btn")
        Button("Click Again").id("btn") 
      }

      Column() {
        Text("Footer").id("foot")
      }
    }
  }
}