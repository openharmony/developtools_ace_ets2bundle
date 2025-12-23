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

import { Entry, Component, Row, Column, Text } from '@ohos.arkui.component';

// Expected: The 'build' function of a standard '@Component' must have exactly one root node.
// Actual: Multiple root nodes (Row and Text) are defined at the top level of this component's build function.

@Component
struct ChainedAndSimpleRootFail {
  build() {
    Row() {}
    Text('Second root')
      .fontSize(16)
      .fontColor(Color.Red)
  }
}

@Entry
@Component
struct TestChainedRootFail {
  build() {
    Column() {
      ChainedAndSimpleRootFail()
    }
  }
}