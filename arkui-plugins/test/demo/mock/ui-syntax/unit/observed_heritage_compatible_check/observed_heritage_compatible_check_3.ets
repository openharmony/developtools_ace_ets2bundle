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
import { ObservedV2, Observed } from "@ohos.arkui.stateManagement";

// Expected: A class decorated with '@Observed' must not inherit from any base class that is decorated with 
// '@ObservedV2'; this inheritance direction is not allowed.
// Actual: The '@Observed' class 'SubX' extends the '@ObservedV2' class 'RootX', so its inheritance hierarchy violates 
// the compatibility rule between '@Observed' and '@ObservedV2'.

@Entry
@Component
struct Index {
  build() {
  }
}

@ObservedV2
class RootX {
  num: number = 10;
}

@Observed
class SubX extends RootX {
  constructor() {
    super();
  }
}

@Component
struct Demo3 {
  x: SubX = new SubX();

  build() {
    Column() {
      Text(this.x.num.toString())
    }
  }
}