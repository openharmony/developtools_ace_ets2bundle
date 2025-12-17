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

import { Entry, Column, Text, If, Row, Button } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: The '@Entry' decorated struct 'Demo2' should not be default exported to avoid ACE Engine preview errors.
// Actual: The rule reports an error because the struct 'Demo2' is decorated with '@Entry' and marked as 'export default'.

@Entry
export default struct Demo2 {
  @State enabled: boolean = true;
  @State text: string = "Demo2";

  build() {
    Column() {
      Text(this.text)
      If(this.enabled) {
        Text("Enabled")
      } else {
        Text("Disabled")
      }
      Row() {
        Button("Toggle")
          .onClick(() => {
            this.enabled = !this.enabled
          })
      }
      Column() {
        Text("Extra block")
        Text("Another line")
      }
    }
  }
}