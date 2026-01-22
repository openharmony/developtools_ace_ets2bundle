/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { Entry, Component, Column, Text, TextInput, Button, $$, Bindable } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

@Entry
@Component
struct MyStateSample {
  @State str1: string = 'Hello World';
  @State str2: string = 'Hello';
  @State newStr: Bindable<string> = $$(this.str1);

  getBindableVar(): Bindable<string> {
    return $$(this.str1);
  }

  build() {
    Column() {
      TextInput({
        text: this.newStr
      })

      TextInput({
        text: this.getBindableVar()
      })

      Button('Test $$').onClick(() => {
        this.newStr = $$(this.str2);
      })
    }
  }
}