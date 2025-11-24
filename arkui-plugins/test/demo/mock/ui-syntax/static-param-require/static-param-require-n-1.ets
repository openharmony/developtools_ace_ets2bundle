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
      // Static property 'a1' can not be initialized through the component constructor.
      StaticChildOne({ a1: 'a11', a2: 'a22' })
      // Static property 'b4' can not be initialized through the component constructor.
      // Static property 'b5' can not be initialized through the component constructor.
      StaticChildTwo({
        b4: 'b44',
        b5: 'b55'
      })
      // Static property 'c1' can not be initialized through the component constructor.
      StaticChildThree({ c1: 'c11', c2: 'c22' })
      // Static property 'd4' can not be initialized through the component constructor.
      // Static property 'd5' can not be initialized through the component constructor.
      StaticChildFour({
        d1: 'd11',
        d4: 'd44',
        d5: 'd55'
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
  @Param static b4: string = 'b4';
  @Require @Param static b5: string = 'b5';
  build() {
    Column() {
      Text('b4: ' + StaticChildTwo.b4)
      Text('b5: ' + StaticChildTwo.b5)
    }
  }
}

@Component
export struct StaticChildThree {
  static c1: string = 'c1';
  c2: string = 'c2';
  build() {
    Column() {
      Text('c1: ' + StaticChildThree.c1)
      Text('c2: ' + this.c2)
    }
  }
}

@ComponentV2
export struct StaticChildFour {
  static d1: string = 'd1';
  @Param static d4: string = 'd4';
  @Require @Param static d5: string = 'd5';
  build() {
    Column() {
      Text('d1: ' + StaticChildFour.d1)
      Text('d4: ' + StaticChildFour.d4)
      Text('d5: ' + StaticChildFour.d5)
    }
  }
}