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

import { Component, $r, $rawfile, Column, Text, Image, TextInput, Select, SelectOption, Margin } from "@ohos.arkui.component"

@Component
struct ResourceComponent {
  str1: string = 'app.media.ri'
  str2: string = 'app.photo2.png'
  build() {
    Column() {
      Text($r('app.string.app_name'))
      Image($rawfile('app.photo.png'))
      TextInput({ text: $r('app.string.input_content') })
      Text($r(this.str1))
      Text($r(this.str2))
      Select(new Array<SelectOption>(
        { value: 'aaa', icon: $r("app.media.selection") },
        { value: 'bbb', icon: $r("app.media.selection") },
        { value: 'ccc', icon: $r("app.media.selection") },
        { value: 'ddd', icon: $r("app.media.selection") }
      ))
      Image($r('app.media.app_icon'))
        .margin({
          top: $r('app.float.elements_margin_horizontal_m'),
          bottom: $r('app.float.elements_margin_horizontal_l')
        } as Margin)
    }
  }
}