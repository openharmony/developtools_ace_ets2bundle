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
import { ObservedV2, Track} from "@ohos.arkui.stateManagement";

// Expected: Classes decorated with @ObservedV2 must use @Trace instead of @Track &&
// @Track can decorate only class member variables.
// Actual: Demo2Model is decorated with @ObservedV2, but its members are decorated with @Track &&
// @Track is applied to methods (increase() and reset()), not to member variables.

@ObservedV2
class Demo2Model {
  @Track value: number = 10;

  @Track
  increase() {
    this.value++;
  }

  @Track
  reset() {
    this.value = 0;
  }

  otherMethod() {
  }
}

@Entry
@Component
struct Demo2 {
  model: Demo2Model = new Demo2Model();

  build() {
    Text("Demo2")
  }
}