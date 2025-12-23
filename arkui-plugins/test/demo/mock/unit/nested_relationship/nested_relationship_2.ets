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

import { Entry, Component, Row, Stack, Blank, ListItem, Text, TextAlign, Alignment, Color } 
from '@ohos.arkui.component';

// Expected: Components like 'Blank' and 'ListItem' must only be nested inside their allowed parent containers 
// (for example, 'Blank' in 'Row/Column/Flex' and 'ListItem' in 'List' or 'ListItemGroup').
// Actual: In this example, 'Blank' is placed inside a 'Scroll' component instead of a 'Row/Column/Flex', 
// and 'ListItem' is used directly under 'Row' instead of 'List' or 'ListItemGroup', so both nested 
// parent constraints are violated.

@Entry
@Component
struct ScrollExampletoolchian09 {
  scroller: Scroller = new Scroller()
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  build() {
    Stack({ alignContent: Alignment.TopStart }) {
      Row(){
       Scroll(){
          Blank().color(Color.Yellow)
        }.width('100%').height('100%')

         ListItem() {
           Text('' )
             .width('100%')
             .height(100)
             .fontSize(16)
             .textAlign(TextAlign.Center)
             .borderRadius(10)
            .backgroundColor(0xFFFFFF)
        }
      }.width('100%').height('100%')
    }.width('100%').height('100%')
    .backgroundColor(Color.Green)
  }
}