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

import { Entry, Component, ComponentV2, Row } from '@ohos.arkui.component'
import { Link, Observed, ObjectLink } from '@ohos.arkui.stateManagement'

@Observed
class ClassA {}

let regularVariable1: number = 10; // variable
let regularVariable2: ClassA = new ClassA(); // variable

@Entry
@Component
struct Parent {
  regular1: number = 10; // regular
  regular2: ClassA = new ClassA(); // regular

  build() {
    Row() {
      // The 'regular' property 'regular2' cannot be assigned to the '@ObjectLink' property 'objectLink2'.
      // The 'regular' property 'regularVariable1' cannot be assigned to the '@Link' property 'link1'.
      // The 'regular' property 'regular1' cannot be assigned to the '@Link' property 'link2'.
      Child1({
        objectLink1: regularVariable2,
        objectLink2: this.regular2,
        link1: regularVariable1,
        link2: this.regular1
      })
    }
  }
}

@Component
struct Child1 {
  @ObjectLink objectLink1: ClassA;
  @ObjectLink objectLink2: ClassA;
  @Link link1: number;
  @Link link2: number;
  build() {
  }
}