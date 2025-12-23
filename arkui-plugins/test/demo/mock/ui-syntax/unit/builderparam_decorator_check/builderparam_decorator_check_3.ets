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
import { Prop, State } from "@ohos.arkui.stateManagement";

// Expected: The 'ZeroBuilderParam' component, initialized with a trailing lambda, must define exactly one @BuilderParam property.
// Actual: The component definition contains zero @BuilderParam properties, so it cannot accept the content provided in the trailing lambda.

@Component
struct ZeroBuilderParam {
  @Prop title: string;
  @State isVisible: boolean = true;

  build() {
    if (this.isVisible) {
      Text(this.title)
    }
  }
}

@Entry
@Component
struct TestScenarioThree {
  build() {
    Column() {
      ZeroBuilderParam({ title: "Warning" }) {
        Text("This content cannot be assigned to any slot.")
      }
    }
  }
}