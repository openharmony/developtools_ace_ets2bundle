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

import { Entry, Component, Column, Text, Button } from '@ohos.arkui.component';
import { Prop, State, Link, Observed } from "@ohos.arkui.stateManagement";

// Expected: @ObjectLink must not have a default value.
// Actual: A default value ('undefined') was assigned to the @ObjectLink property 'count'.

@Observed
class ClassAobject05 {
  public a: number;

  constructor(a: number) {
    this.a = a;
  }
}

@Observed
class ClassBobject05 {
  public b: number;

  constructor(b: number) {
    this.b = b;
  }
}

@Entry
@Component
struct Page2object05 {
  @State count: ClassAobject05 | ClassBobject05 | undefined = new ClassAobject05(10)

  build() {
    Column() {
      Childobject05({ count: this.count })

      Button('change count property')
        .onClick(() => {
          // 判断count的类型，做属性的更新
          if (this.count instanceof ClassAobject05) {
            this.count.a += 1
          } else if (this.count instanceof ClassBobject05) {
            this.count.b += 1
          } else {
            console.info('count is undefined, cannot change property')
          }
        })

      Button('change count to ClassA')
        .onClick(() => {
          // 赋值为ClassA的实例
          this.count = new ClassAobject05(100)
        })

      Button('change count to ClassB')
        .onClick(() => {
          // 赋值为ClassA的实例
          this.count = new ClassBobject05(100)
        })

      Button('change count to undefined')
        .onClick(() => {
          // 赋值为undefined
          this.count = undefined
        })
    }.width('100%')
  }
}

@Component
struct ChildObject05 {
  @ObjectLink count: ClassAobject05 | ClassBobject05 | undefined=undefined

  build() {
    Column() {
      Text(`count is instanceof ${this.count instanceof ClassAobject05 ? 'ClassA' : this.count instanceof ClassBobject05 ? 'ClassB' : 'undefined'}`)
        .fontSize(30)

      Text(`count's property is  ${this.count instanceof ClassAobject05 ? this.count.a : this.count?.b}`).fontSize(15)

    }.width('100%')
  }
}