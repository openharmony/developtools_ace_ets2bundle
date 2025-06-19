/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, $r, $rawfile, Column, Text, Image, TextInput, Select, SelectOption, Margin, ImageAnimator, Resource } from "@kit.ArkUI"

@Component
struct MyStateSample {
  str1: string = 'app.media.ri'
  str2: string = 'app.photo2.png'
  raw: string = 'app.photo.png'
  tt: string[] = ['0','1','3','5','8']
  
  aboutToAppear() {
    let arr: Array<Resource> = new Array<Resource>()
    for (let i=0; i<5; i++) {
      arr.push($r('sys.string.ohos_lab_location'))
    }
    for (let item of this.tt) {
      arr.push($r('sys.string.ohos_lab_microphone'))
    }
  }

  build() {
    Column() {
      Text($r('app.string.ohos_lab_microphone'))
      Column() {
        Text($r('sys.string.ohos_id_text_font_family_regular'))
        Text($r('sys.string'.concat('.ohos_id_text_font_family_regular')))
        Image($rawfile(this.raw))
        TextInput({ text: $r('sys.string.ohos_desc_manage_local_accounts') })
        Text($r(this.str1))
        Text($r(this.str2))
        Select(new Array<SelectOption>(
          { value: 'aaa', icon: $r("sys.media.ohos_ic_public_play_last") },
          { value: 'bbb', icon: $r("sys.media.ohos_ic_public_play_last") },
          { value: 'ccc', icon: $r("sys.media.ohos_ic_public_play_last") },
          { value: 'ddd', icon: $r("sys.media.ohos_ic_public_play_last") }
        ))
        Image($r('sys.media.ohos_ic_public_arrow_left'))
          .margin({
            top: $r('sys.float.ohos_id_alpha_content_primary'),
            bottom: $r('sys.float.ohos_id_alpha_content_primary_dark')
          } as Margin)
        ImageAnimator().images([
          {
            src: $r('sys.media.ohos_ic_public_arrow_left')
          },
          {
            src: $r('sys.media.ohos_ic_public_arrow_left')
          },
        ])
      }
    }
  }
}