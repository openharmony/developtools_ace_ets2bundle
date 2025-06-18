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

import { Text, Entry, Column, Component, $$, Grid, GridItem } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

let c: boolean = false

@Entry
@Component
struct MyStateSample {
  @State boo: boolean = true
  build() {
    Column() {
      Grid() {
        GridItem() {
          Text('nihao')
        }.selected($$(this.boo))
        GridItem() {
          Text('nihao')
        }.selected($$(c))
      }
    }
  }
}