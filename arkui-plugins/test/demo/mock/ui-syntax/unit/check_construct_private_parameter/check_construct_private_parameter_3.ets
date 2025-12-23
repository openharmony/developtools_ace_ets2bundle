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

import { Entry, Component, Row, Column, Text, ForEach, ItemRow } from '@ohos.arkui.component';
import { Prop, State } from "@ohos.arkui.stateManagement";

// Expected: Private property 'uniqueId' in 'ItemRow' must not be initialized via the constructor.
// Actual: 'ListRenderPage' initializes private 'uniqueId' in 'ItemRow', violating the private property constraint.

@Component
struct ItemRow {
  private uniqueId: number = -1;
  @Prop label: string;

  build() {
    Row() {
      Text(`ID: ${this.uniqueId}`).fontSize(12)
      Text(this.label).fontSize(16)
    }
  }
}

@Entry
@Component
struct ListRenderPage {
  @State dataList: string[] = ['Apple', 'Banana', 'Cherry'];

  build() {
    Column() {
      ForEach(this.dataList, (item: string, index: number) => {
        ItemRow({
          label: item,
          uniqueId: index
        })
      })
    }
  }
}