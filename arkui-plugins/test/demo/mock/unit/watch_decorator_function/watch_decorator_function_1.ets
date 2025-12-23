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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { State, Watch } from "@ohos.arkui.stateManagement";

// Expected: The '@Watch' decorator must receive a string value (e.g., { cb: "methodName" }).
// Actual: The value '123' is not a string, so '@Watch' cannot accept it.

@Entry
@Component
struct Demo1Child {
  @State count: number = 1;
  @State
  @Watch({ cb: 123 })
  value: number = 10;

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@Component
struct Demo1Parent {
  @State label: string = "parent";

  build() {
    Demo1Child()
  }
}