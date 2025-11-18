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

import { Entry, Row, Component, Text, FontWeight, Builder } from '@ohos.arkui.component'

@Builder
function customBuilder() {
  Text('123')
    .fontColor('#ffff')
    .borderColor("#fff")
      // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
    .padding('12vp')
      // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
    .borderWidth("10vp")
      // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
    .borderRadius("10vp")
    .borderWidth("10px")
    .borderRadius("10px")
      // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
    .outlineWidth("10vp")
      // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
    .outlineRadius("10vp")
    .outlineWidth("10px")
    .outlineRadius("10px")
    .fontWeight(FontWeight.Bold)
      // It is recommended that you use layered parameters for easier color mode switching and theme color changing.
    .foregroundColor("#ffffffff")
}

@Entry
@Component
struct Index {
  build() {
    Row() {
      Text('123')
        .fontColor('#ffff')
        .borderColor("#fff")
        .padding('12px')
          // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
          // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
        .borderWidth("10vp").borderRadius("10vp")
        .borderWidth("10px").borderRadius("10px")
        // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
        // It is recommended that you use layered parameters for polymorphism development and resolution adaptation.
        .outlineWidth("10vp").outlineRadius("10vp")
        .outlineWidth("10px").outlineRadius("10px")
        .fontWeight(FontWeight.Bold)
          // It is recommended that you use layered parameters for easier color mode switching and theme color changing.
        .foregroundColor("#ffffffff")
    }
  }
}