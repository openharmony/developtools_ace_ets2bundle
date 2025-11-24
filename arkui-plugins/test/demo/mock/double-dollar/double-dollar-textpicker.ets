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

import { Text, Column, Component, TextInput, $$, TextPicker, TextPickerOptions } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

@Component
struct MyStateSample {
  @State tt: string = "state var";
  @State index: int = 1;
  @State select: int = 0;
  @State selectArr: int[] = [0, 1, 2];
  fruits: string[] = ['apple1', 'orange2', 'peach3', 'grape4'];

  build() {
    Column() {
      TextInput({
        text: $$(this.tt)
      })
      TextPicker({
        range: this.fruits,
        selected: $$(this.select),
        value: $$(this.fruits[0])
      } as TextPickerOptions)
      TextPicker({
        range: this.fruits,
        selected: $$(this.selectArr),
        value: $$(this.fruits)
      } as TextPickerOptions)
      TextPicker({
        range: this.fruits,
        selected: $$(this.selectArr),
        value: $$(this.fruits[this.index])
      } as TextPickerOptions)
    }.margin(10)
  }
}