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

// Expected: The 'alignItems' attribute should be invoked as a method e.g., .alignItems(HorizontalAlign.Start).
// Actual: The 'alignItems' property is accessed without invocation on a 'Column' component initialized with parameters.

@Entry
@Component
struct ContainerParamsTest {
  build() {
    Column().width(100).alignItems
  }
}