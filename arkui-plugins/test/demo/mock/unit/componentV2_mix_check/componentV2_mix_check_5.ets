/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component, ComponentV2, Column, Text } from '@ohos.arkui.component';

// Expected: This struct uses ONLY '@ComponentV2'. It should NOT trigger any errors.
// Actual: 'CleanV2Struct' is a valid V2 component.

@ComponentV2
struct CleanV2Struct {
  build() {
    Column() {
      Text("I am a valid V2 component")
    }
  }
}

// Expected: This struct uses ONLY '@Component' (V1). It should NOT trigger THIS specific rule.
// Actual: 'CleanV1Struct' is a valid V1 component and should be ignored by V2 mix check.

@Entry
@Component
struct CleanV1Struct {
  build() {
    Column() {}
  }
}