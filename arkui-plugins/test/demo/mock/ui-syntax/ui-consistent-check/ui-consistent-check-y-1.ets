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

import { Entry, Row, Component, Text, FontWeight, Builder, $r } from '@ohos.arkui.component'

@Builder
function customBuilder() {
  Text('123')
    .fontColor('#ffff')
    .borderColor("#fff")
    .padding($r('sys.float.corner_radius_level6'))
    .borderWidth($r('sys.float.corner_radius_level5'))
    .borderRadius($r('sys.float.corner_radius_level5'))
    .borderWidth("10px")
    .borderRadius("10px")
    .outlineWidth($r('sys.float.corner_radius_level5'))
    .outlineRadius($r('sys.float.corner_radius_level5'))
    .outlineWidth("10px")
    .outlineRadius("10px")
    .fontWeight(FontWeight.Bold)
    .foregroundColor($r('sys.color.navigation_drag_bar_item_default'))
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
        .borderWidth($r('sys.float.corner_radius_level5')).borderRadius($r('sys.float.corner_radius_level5'))
        .borderWidth("10px").borderRadius("10px")
        .outlineWidth($r('sys.float.corner_radius_level5')).outlineRadius($r('sys.float.corner_radius_level5'))
        .outlineWidth("10px").outlineRadius("10px")
        .fontWeight(FontWeight.Bold)
        .foregroundColor($r('sys.color.navigation_drag_bar_item_default'))
    }
  }
}