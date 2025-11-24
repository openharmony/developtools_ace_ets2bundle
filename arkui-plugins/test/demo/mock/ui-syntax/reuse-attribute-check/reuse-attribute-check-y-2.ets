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

import { Entry, Component, Row, Column, ComponentV2, Reusable } from '@ohos.arkui.component'

@Reusable
@Component
struct reusableV2{
  build() {
  }
}
@Entry
@ComponentV2
struct Parent {
  build() {
    Row() {
      reusableV2()
        .reuseId("V2") // The reuseId attribute is not applicable to custom components decorated with both @ComponentV2 and @ReusableV2.
    }
  }
}