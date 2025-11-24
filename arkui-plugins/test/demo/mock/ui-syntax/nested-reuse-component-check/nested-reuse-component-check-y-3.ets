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

import { Entry, Component, ComponentV2, Column, Reusable, Repeat, RepeatItem } from '@ohos.arkui.component'
import { Local } from '@ohos.arkui.stateManagement'

@Entry
@ComponentV2
struct validateReusableV2InRepeat {
  @Local arr:string[] = ['1','2','3'];
  build() {
    Column() {
      Repeat<string>(this.arr)
        .template('temp', (obj: RepeatItem<string>) => {
          // The template attribute of the Repeat component cannot contain any custom component decorated with @ReusableV2.
          V1R()
        })
    }
  }
}

@Component
export struct V1R {
  build() {}
}