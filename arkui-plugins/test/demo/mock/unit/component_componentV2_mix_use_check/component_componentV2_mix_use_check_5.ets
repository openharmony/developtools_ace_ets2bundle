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

import { Component, ObservedV2, Column, Text } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";
 
// Expected: In this deep alias validation, the '@State' decorator cannot be used
// with a type aliased to an '@ObservedV2' class.
// Actual: The 'data' property uses 'FinalData', which resolves to 'ComplexData' (@ObservedV2), violating the rule.

@Component
@ObservedV2
class ComplexData {
  id: number = 1;
}

type BaseData = ComplexData;
type FinalData = BaseData;

@Component
struct DeepAliasTest {
  @State data: FinalData = new ComplexData();

  build() {
    Column() {
      Text(`${this.data.id}`)
    }
  }
}