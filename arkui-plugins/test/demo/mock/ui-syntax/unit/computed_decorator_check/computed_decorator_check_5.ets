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
import { State, Computed } from "@ohos.arkui.stateManagement";

// Expected: The '@Computed' annotation can only be used in a 'struct' decorated with '@ComponentV2'.
// Actual: The struct uses the V1 '@Component' decorator, but attempts to use the V2 '@Computed' decorator.

@Entry
@Component
struct V1ComponentMismatch {
  @State count: number = 0;

  @Computed
  get doubleCount() {
    return this.count * 2;
  }

  build() {
    Column() {
      Text(`${this.doubleCount}`)
    }
  }
}