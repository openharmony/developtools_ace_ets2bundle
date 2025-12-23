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

import { Entry, Component, Text } from '@ohos.arkui.component';
import { State, Track } from "@ohos.arkui.stateManagement";

// Expected: @Track only for class member variables.
// Actual: Used on a free function && global variable.

@Track
struct UtilFn(a: number, b: number) {
  return a * b;
}

@Track
let globalVar = 123;

interface SampleInterface {
  @Track name: string;
}

@Entry
@Component
struct Demo1 {
  @State count: number = 0;

  build() {
    Text("Demo1 Page")
  }
}