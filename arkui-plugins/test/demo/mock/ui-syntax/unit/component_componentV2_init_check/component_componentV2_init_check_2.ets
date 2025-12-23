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
import { Prop, Local } from "@ohos.arkui.stateManagement";

// Expected: No error should be reported.
// Actual: 'V2ComponentValidUsage' uses 'V1ComponentWithoutLink', which has '@Prop' but no '@Link'.
// This is a valid scenario for V2 components interacting with V1 components.

@Component
struct V1ComponentWithoutLink {
  @Prop message: string; 

  build() {
    Text(this.message)
  }
}

@Entry
@ComponentV2
struct V2ComponentValidUsage {
  @Local message: string = 'Hello World';

  build() {
    Column() {
      V1ComponentWithoutLink({ message: this.message })
    }
  }
}