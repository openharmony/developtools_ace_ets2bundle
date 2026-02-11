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

import { Component, $r, $rawfile, Column, Text, Image, TextInput, Select, SelectOption, Margin, ImageAnimator, Resource } from "@ohos.arkui.component"

@Component
struct ResourceComponent {
  str1: string = 'app.media.ri'
  str2: string = 'app.photo2.png'
  numbers: string[] = ['0','1','3','5','8']

  async test_0(res: Resource) {
    return res;
  }

  aboutToAppear() {
    let arr: Array<Resource> = new Array<Resource>()
    for (let i = 0; i < 5; i++) {
      arr.push($r('app.string.app_name'))
    }
    for (let item of this.numbers) {
      arr.push($r('app.string.app_name'))
    }
    waitForCompletion(async ()=>{const a2 = await this.test_0($r('app.string.app_name'));})
  }

  build() {
    Column() {
      Text($r('app.string.app_name'))
      Image($rawfile('app.mock.txt'))
      TextInput({ text: $r('app.string.module_desc') })
      Text($r(this.str1))
      Text($r(this.str2))
      Select(new Array<SelectOption>(
        { value: 'aaa', icon: $r("app.media.background") },
        { value: 'bbb', icon: $r("app.media.background") },
        { value: 'ccc', icon: $r("app.media.background") },
        { value: 'ddd', icon: $r("app.media.background") }
      ))
      Image($r('app.media.app_icon'))
        .margin({
          top: $r('app.float.page_text_font_size'),
          bottom: $r('app.float.page_text_font_size')
        } as Margin)
      ImageAnimator().images([
        {
          src: $r('app.media.app_icon')
        },
        {
          src: $r('app.media.layered_image')
        },
      ])
    }
  }
}