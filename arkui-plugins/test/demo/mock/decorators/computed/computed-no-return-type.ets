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

import { Computed, ObservedV2, Trace } from "@ohos.arkui.stateManagement"
import { ComponentV2, Column, Button, Divider, Text } from "@ohos.arkui.component"
import { Computed, Local } from "@ohos.arkui.stateManagement"

@ObservedV2
class Name {
  @Trace firstName: string = 'Hua';
  @Trace lastName: string = 'Li';
  age: number = 20;

  @Computed
  get fullName() {
    if (this.age >= 20) {
        return new Array<number>(0, 1, 2);
    }
    return this.firstName + ' ' + this.lastName;
  }
}

@ComponentV2
struct Index {
  @Local firstName: string = 'Li';
  @Local lastName: string = 'Hua';
  age: number = 20;

  @Computed
  get fullName() {
    if (this.age >= 20) {
        return 500
    }
    return this.firstName + ' ' + this.lastName + this.age;
  }

  @Computed
  get num5() {
    return 5;
  }

  build() {}
}