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

import { Component, ComponentV2, Row, Column, Text, Button, Entry } from '@ohos.arkui.component';
import { Prop, State } from "@ohos.arkui.stateManagement";

// Expected: A '@ComponentV2' custom component must not render child components that are decorated with 
// '@Reusable' (v1). Reusable v1 components are not supported inside a v2 component tree, so using them as children of 
// a '@ComponentV2' struct is considered invalid.
// Actual: The '@ComponentV2' struct 'Dashboard' renders the child component 'CardItem', which is decorated with 
// '@Reusable'. This v1 reusable component is used inside a v2 component, so the rule reports: When a custom component 
// is decorated with @ComponentV2 and contains a child component decorated with @Reusable, the child component will not
// create."

@Entry
@Reusable
@Component
struct CardItem {
  @Prop title: string;
  build() {
    Row() {
      Text(this.title)
    }
  }
}

@ComponentV2
struct Dashboard {
  counter: number = 0;

  build() {
    Column() {
      Text("Dashboard")
      Button("Increase").onClick(() => {
        this.counter++
      })

      CardItem({ title: "My Card" })
    }
  }
}