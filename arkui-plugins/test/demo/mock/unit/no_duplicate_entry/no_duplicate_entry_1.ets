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

import { Entry, Component, Column, Text, FontWeight, Builder, BuilderParam } from '@ohos.arkui.component';
import { State, Prop, Provide } from "@ohos.arkui.stateManagement";

// Expected: A single ETS page file may contain at most one '@Entry' annotation; multiple components in the same file 
// must not all be marked as '@Entry'.
// Actual: This file declares two structs, 'Page1struct02' and 'AccessRestrictions', both annotated with '@Entry', 
// so the page ends up with multiple entry components.

@Entry
@Component
struct Page1struct02 {
  @Builder
  buildTest() {}

  build() {
    Column() {
      Childstruct02()
    }
    .width('100%')
  }
}

@Component
struct Childstruct02 {
  @State private state_value: string = "hello";
  @Prop private prop_value: string = "hello";
  @Provide private provide_value: string = "hello";
  @BuilderParam private builder_value: () => void = this.buildTest;
  private regular_value: string = "hello";

  @Builder
  buildTest() {}

  build() {}
}

@Entry
@Component
struct AccessRestrictions {
  @Builder buildTest() {
    Text("Parent builder")
  }
  build() {
    Column() {
      ComponentsChild()
    }
    .width('100%')
  }
}

@Component
struct ComponentsChild {
  @State private state_value: string = "Hello";
  @Prop private prop_value: string = "Hello";
  @Provide private provide_value: string = "Hello";
  @BuilderParam private builder_value: () => void = this.buildTest;
  private regular_value: string = "Hello";
  @Builder buildTest() {
    Text("Child builder")
  }
  build() {
    Column() {
      Text("Hello")
        .fontSize(50)
        .fontWeight(FontWeight.Bold)
    }
  }
}
