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

import { Entry, Component, Row, Column, Text, FontWeight } from '@ohos.arkui.component';
import { Trace, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: The '@Trace' annotation can only decorate member variables inside a class that is decorated with 
// '@ObservedV2'. It cannot be used inside a custom component (@Component/@Entry) and it cannot decorate methods.
// Actual: In 'AddLog', the '@Trace' annotation is applied to the member variable 'log' of a @Component struct, which 
// is not a class and is not decorated with '@ObservedV2'. Additionally, in class 'C', '@Trace' is incorrectly applied 
// to the method 'onChange()', even though '@Trace' may only decorate fields, not methods.

@Entry
@Component
struct AddLog {
  @Trace log: string = 'Hello Word!';

  build() {
    Row() {
      Column() {
        Text(this.log)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}
@ObservedV2
class C {
  @Trace onChange() {}
}