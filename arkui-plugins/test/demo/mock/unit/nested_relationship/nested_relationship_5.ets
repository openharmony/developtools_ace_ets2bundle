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

import { Entry, Component, Column, Blank, Text } from '@ohos.arkui.component';

// Expected: Atomic components such as 'Blank' cannot have any child content block.
// Actual: 'Blank' is used with a child block that contains a 'Text' component, so it incorrectly has children.

@Entry
@Component
struct AtomicChildExample {
  build() {
    Column() {
      Blank() {
        Text('invalid child')
      }
    }
  }
}
