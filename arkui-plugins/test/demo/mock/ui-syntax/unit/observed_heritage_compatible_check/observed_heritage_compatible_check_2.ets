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

import { Component, Column, Text, Entry } from '@ohos.arkui.component';
import { Observed, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: A class decorated with '@ObservedV2' must not inherit from any base class that is decorated with 
// '@Observed'; mixing '@ObservedV2' subclasses with '@Observed' superclasses is not allowed.
// Actual: The '@ObservedV2' class 'ChildA' extends the '@Observed' class 'BaseA', so this inheritance relationship 
// violates the compatibility rule between '@ObservedV2' and '@Observed'.

@Entry
@Component
struct Index {
  build() {
  }
}

@Observed
class BaseA {
  value: number = 1;
}

@ObservedV2
class ChildA extends BaseA {
  constructor() {
    super();
  }
}

@Component
struct Demo2 {
  a: ChildA = new ChildA();

  build() {
    Column() {
      Text(this.a.value.toString())
    }
  }
}