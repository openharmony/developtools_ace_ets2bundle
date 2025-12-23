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

import { Entry, Component, Row, Column, Text, BuilderParam } from '@ohos.arkui.component';

// Expected: The 'MultipleBuilderParamUsage' component, when initialized with a trailing lambda, 
// must define exactly one @BuilderParam property to resolve assignment.
// Actual: The component definition contains multiple (2) @BuilderParam properties ('header', 'footer'), 
// causing an ambiguity error in this usage case.

@Component
struct MultipleBuilderParamUsage {
  @BuilderParam header: () => void;
  @BuilderParam footer: () => void;

  build() {
    Column() {
      this.header()
      Row().height(50)
      this.footer()
    }
  }
}

@Entry
@Component
struct TestScenarioTwo {
  build() {
    Column() {
      MultipleBuilderParamUsage() {
        Text("header or footer? unclear.")
      }
    }
  }
}