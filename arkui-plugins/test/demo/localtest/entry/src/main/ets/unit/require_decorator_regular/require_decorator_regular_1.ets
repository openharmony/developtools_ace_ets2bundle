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

import { Entry, Component, Column, Builder } from '@ohos.arkui.component';
import { State, Prop, Provide, BuilderParam, Require } from "@ohos.arkui.stateManagement";

// Expected: Properties decorated with '@Require' must not be private, because they are meant to be supplied from the
// component constructor and therefore must be publicly accessible on the struct.
// Actual: In 'structChild', the properties 'state_value', 'prop_value', 'provide_value', 'builder_value' and 
// 'regular_value' are all marked as 'private' and also decorated with '@Require', so the rule reports
// "Property '... ' can not be decorated with both Require and private."

@Entry
@Component
struct StructPage1 {
  @Builder
  buildTest() {}

  build() {
    Column() {
      structChild({
        state_value: "hh",
        prop_value: "hh",
        provide_value: "hh",
        builder_value: this.buildTest,
        regular_value: "hh"
      })
    }
    .width('100%')
  }
}

@Component
struct StructChild {
  @Require @State private state_value: string = "hello";
  @Require @Prop private prop_value: string = "hello";
  @Require @Provide private provide_value: string = "hello";
  @Require @BuilderParam private builder_value: () => void = this.buildTest;
  @Require private regular_value: string = "hello";

  @Builder
  buildTest() {}

  build() {}
}