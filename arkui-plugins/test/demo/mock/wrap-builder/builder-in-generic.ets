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

import { Builder, Text, Color, WrappedBuilder, wrapBuilder, Entry, Component, Row, ForEach } from '@ohos.arkui.component';
import { State } from '@ohos.arkui.stateManagement';

@Builder
function MyBuilder(value: string, size: number) {
  Text(value)
    .fontSize(size)
}

@Builder
function YourBuilder(value: string, size: number) {
  Text(value)
    .fontSize(size)
    .fontColor(Color.Pink)
}

let globalBuilder: (@Builder (value: string, size: number) => void) = MyBuilder;
let builderArr: (@Builder (value: string, size: number) => void)[] = [MyBuilder, YourBuilder]

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  build() {
    Row() {
      globalBuilder(this.message, 50);
      ForEach(builderArr, (item: (@Builder (value: string, size: number) => void)) => {
        item('Hello World', 30);
      })
    }.height('100%')
  }
}