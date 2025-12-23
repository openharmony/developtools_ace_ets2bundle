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

import { Entry, Component, Column, Text, BuilderParam } from '@ohos.arkui.component';

// Expected: The 'SingleParamCard' component has exactly one @BuilderParam property ('content').
// Actual: The validation rule should PASS this usage as it strictly adheres to the trailing lambda requirement.

@Component
struct SingleParamCard {
  @BuilderParam content: () => void;

  build() {
    Column() {
      Text("Card Header")
      this.content()
      Text("Card Footer")
    }
  }
}

@Entry
@Component
struct HappyPathTest {
  build() {
    Column() {
      SingleParamCard() {
        Text("This is valid content injected into the single slot.")
      }
    }
  }
}