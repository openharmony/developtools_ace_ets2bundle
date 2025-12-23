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

import { Component, ComponentV2, Column, Text } from '@ohos.arkui.component';
import { Param, Event, Local } from "@ohos.arkui.stateManagement";

// Expected: A struct defined with '@ComponentV2' must not also use the conflicting '@Component' decorator.
// Actual: The struct 'Hunyong' is decorated with both '@ComponentV2' and '@Component', violating the rule.

@ComponentV2
@Component
struct Hunyong {
  @Param name: string = 'hello, child';
  @Event name_event: () => void

  build() {
    Column() {
      Text(`Child: ${this.name}`)
    }
  }
}

@Entry
@ComponentV2
struct Hunyongpar {
  @Local name: string = 'hello, parent';

  build() {
    Column() {
      Text(`Parent: ${this.name}`)
      Hunyong()
    }
  }
}