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

import { Entry, ComponentV2, Column, Text, Button } from '@ohos.arkui.component';
import { Computed } from "@ohos.arkui.stateManagement";

// Expected: In this scope validation, '@Computed' must only be used within a class decorated with '@ObservedV2'.
// Actual: The 'Name' class lacks '@ObservedV2', making the usage of '@Computed' on 'fullName' invalid.

class Name {
  firstName: string = 'Li';
  lastName: string = 'Hua';

  @Computed
  get fullName() {
    console.info('---------Computed----------');
    return this.firstName + ' ' + this.lastName;
  }
}

const name: Name = new Name();

@Entry
@ComponentV2
struct Index {
  name1: Name = name;

  build() {
    Column() {
      Text(this.name1.fullName)
      Text(this.name1.fullName)
      Button('changed lastName').onClick(() => {
        this.name1.lastName += 'a';
      })
    }
  }
}