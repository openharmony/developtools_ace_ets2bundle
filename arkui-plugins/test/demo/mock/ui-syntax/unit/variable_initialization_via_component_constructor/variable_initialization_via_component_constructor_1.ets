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

import { Entry, Component, ComponentV2, Text, Column, Button } from '@ohos.arkui.component';
import { Param, State, Require } from "@ohos.arkui.stateManagement";

// Expected: A property decorated with '@Require' must receive its value
// through the component's constructor (e.g., Param22nullParamChild({ count1: ... })).
// Actual: 'count1' is decorated with '@Require' but no value is passed to the
// constructor when 'Param22nullParamChild()' is created, so initialization is missing.

@Entry
@Component
struct Param22nullParamValue {
  @State count: number = 0;
  build() {
    Column() {
      Text(`Local ${this.count}`).id('param_local')
      Button('change Local').id('param_null')
        .onClick(()=>{
          this.count++;
        })
      Param22nullParamChild()
    }
  }
}
@ComponentV2
struct Param22nullParamChild {
  @Require @Param count1: number;
  build() {
    Column() {
      Text(`Param ${this.count1}`)
    }
  }
}