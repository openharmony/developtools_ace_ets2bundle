/*
 * Copyright (c) 2022-2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.ta
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Column, Row, Button, Text, Entry } from '@ohos.arkui.component';

// Expected: A 'Button' component that is invoked with a string label parameter must not provide a child content block,
// as labeled Button components cannot contain any nested child components.
// Actual: The 'Button("Press")' call includes a child block containing a 'Text' component, so a labeled Button is 
// incorrectly defined with nested children.

@Entry
@Component
struct ButtonCheckNested {
  build() {
    Column() {
      Row() {
        Button('Press') {
          Text('Nested')
        }
      }
    }
  }
}