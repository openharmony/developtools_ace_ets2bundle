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

import { Entry, Component, Row, Text, ComponentV2 } from '@ohos.arkui.component';
import { Require, Param, Event } from "@ohos.arkui.stateManagement";

// Expected: Properties decorated with '@Require' must not be private, because required fields must be externally 
// assignable through the component constructor. A private field cannot be provided by the caller, so '@Require' and 
// 'private' cannot be combined.
// Actual: In 'DemoRequireCase3', both 'age' and 'onSubmit' are marked as private while also using '@Require', so each 
// property violates the rule: "Property '...' can not be decorated with both Require and private.

@ComponentV2
struct DemoRequireCase3 {
  @Require @Param private age: number
  @Require @BuilderParam private onSubmit: () => void
  build() {
    Row() {
      Text("Demo 3")
    }
  }
}

@Entry
@Component
struct Test {
  build() {
  }
}