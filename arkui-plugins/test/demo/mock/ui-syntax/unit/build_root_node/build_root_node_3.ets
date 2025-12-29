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

import { Entry, Component, Span } from '@ohos.arkui.component';

// Expected: In an '@Entry' decorated component, the 'build' function root must be a container component.
// Actual: The 'build' function has a single root node, but it is an atomic component ('Span'), which is invalid for @Entry.

@Entry
@Component
struct AtomicRootFail {
  // Error expected on the next line [25,3]
  build() { 
    Span('Hello World')
      .fontSize(20)
      .fontColor(Color.Blue)
  }
}