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

import { Entry, Component, Text, Column, BuilderParam, Builder } from '@ohos.arkui.component'

@Builder
function builderFunc() {
  Text('Builder Content')
}

function regularFunc() {
  Text('Builder Content')
}

@Component
struct MyComponent {
  @BuilderParam content: () => void = builderFunc;

  build() {
  }
}

@Entry
@Component
struct Main {
  build() {
    Column() {
      // '@BuilderParam' attribute 'content' can only initialized by '@Builder' function or '@Builder' method in struct.
      MyComponent({ content: regularFunc })
    }
  }
}