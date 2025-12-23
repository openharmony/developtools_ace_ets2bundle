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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';

// Expected: The 'build' function can have only one root node.
// Actual: The 'build' function contains multiple (2) root nodes: one standard container ('Column') and one custom component ('HeaderComponent').

@Component
struct HeaderComponent {
  build() {
    Text('Header')
  }
}

@Entry
@Component
struct MixedRootFail {
  build() {
    Column() {
      Text('Content Area')
    }
    
    HeaderComponent()
  }
}