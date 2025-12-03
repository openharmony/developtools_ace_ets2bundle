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
import { Trace, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: New V2 decorators such as '@Local' and '@Param' must only decorate fields inside custom component structs
// that are annotated with '@ComponentV2'. They cannot be used inside regular classes. Actual: The normal class 
// 'v2DecoratorInClass' uses '@Local' and '@Param' on its member variables even though it is not a '@ComponentV2' 
// struct, so these V2 decorators are applied in an invalid context.

@Entry
@Component
struct ValidateTrackObservedHomeComponent {
  @Trace value: string = '';
  build() {
    Column() {
      Text("hello")
    }
    .height(500)
  }
}

@ObservedV2
@Component
struct child {
  build() {
    Text("")
  }
}

class A {
  @Trace value: string = '';
}

@ObservedV2
class B {
  @Trace value: string = '';
}