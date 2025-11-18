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

import { Entry, Component, Text, Builder, Column, BuilderParam } from '@ohos.arkui.component'

@Component
struct MyComponent {
  @BuilderParam content1: () => void = myBuilder;
  @BuilderParam content2: () => void = myBuilder;

  build() {
  }
}

@Builder function myBuilder() {
  Text('Builder Content')
}

@Entry
@Component
struct Main {
  @Builder mainBuilder() {
    Text('Builder Content')
  }

  build() {
    Column() {
      MyComponent({ content1: myBuilder, content2: this.mainBuilder })
    }
  }
}