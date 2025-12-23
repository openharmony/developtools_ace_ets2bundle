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
import { Provide, Consume } from "@ohos.arkui.stateManagement";

// Expected: The '@Consume' property 'message' in the custom component 'ChildComponent' 
// cannot be initialized here (forbidden to specify).
// Actual: The parent component attempts to initialize 'message' via the constructor, 
// which violates the rule for @Consume decorated properties.

@Entry
@Component
struct ParentComponent {
  @Provide message: string = "Hello World";

  build() {
    Column() {
      ChildComponent({ message: this.message })
    }
  }
}

@Component
struct ChildComponent {
  @Consume message: string;

  build() {
    Column() {
      Text(this.message)
    }
  }
}