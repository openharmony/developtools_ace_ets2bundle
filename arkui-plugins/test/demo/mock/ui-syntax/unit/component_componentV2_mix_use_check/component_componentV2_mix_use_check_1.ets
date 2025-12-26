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

import { Entry, Component, ComponentV2, Row, Column, Button, Text } from '@ohos.arkui.component';
import { State, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: In this mixed-use validation, a property decorated with '@State' cannot be an '@ObservedV2' class.
// Actual: The 'profile' property is typed as 'ProfileModel' (@ObservedV2), which is forbidden with '@State'.

@ObservedV2
class ProfileModel {
  name: string = "Guest";
  age: number = 18;
}

@ComponentV2
struct Demo1Child {
  @State profile: ProfileModel = 
  { 
    name: "Test", 
    age: 20 
  };

  @State counter: number = 0;

  build() {
    Column() {
      Text(this.profile.name)
      Text(this.counter.toString())
      Row() {
        Button("Inc")
          .onClick(() => {
            this.counter += 1;
          })
        Button("Reset")
          .onClick(() => {
            this.counter = 0;
          })
      }
    }
  }
}

@ComponentV2
struct Demo1Parent {
  @State title: string = "User Page";
  private index: number = 10;

  build() {
    Column() {
      Text(this.title)
      Demo1Child({
        counter: this.index
      })
    }
  }
}