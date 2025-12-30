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

import { Entry, Component, Row, Text } from '@ohos.arkui.component';
import { State, Watch } from "@ohos.arkui.stateManagement";

// Expected: The '@Watch' decorator must reference an existing method name as its callback.
// Actual: The callback 'nonExistingMethod' does not correspond to any method.

@Entry
@Component
struct Demo2Child {
  @State msg: string = "hello";
  @State
  @Watch({ cb: "nonExistingMethod" })
  text: string = "ok";

  build() {
    Row() {
      Text(this.msg)
    }
  }
}

@Component
struct Demo2Parent {
  @State title: string = "main";

  build() {
    Demo2Child()
  }
}