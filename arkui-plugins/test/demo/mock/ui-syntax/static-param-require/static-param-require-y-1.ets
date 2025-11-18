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

import { Entry, Text, Column, Component, ComponentV2 } from '@ohos.arkui.component'
import { Param, Require } from '@ohos.arkui.stateManagement'

@Entry
@Component
struct TestStaticVariableAssignment {
  build() {
    Column() {
      StaticChildOne({ a2: 'a22' })
      StaticChildTwo({
        b4: 'b44',
        b5: 'b55'
      })
    }
    .height('100%')
    .width('100%')
  }
}

@Component
struct StaticChildOne {
  static a1: string = 'a1';
  a2: string = 'a2';
  build() {
    Column() {
      Text('a1: ' + StaticChildOne.a1)
      Text('a2: ' + this.a2)
    }
  }
}

@ComponentV2
struct StaticChildTwo {
  @Param b4: string = 'b4';
  @Require @Param b5: string = 'b5';
  build() {
    Column() {
      Text('b4: ' + this.b4)
      Text('b5: ' + this.b5)
    }
  }
}