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

import { Entry, Component, Row, Column } from '@ohos.arkui.component'
import { State, PropRef, Link, Provide, ObjectLink, Observed } from '@ohos.arkui.stateManagement'

@Entry
@Component
struct Foo {
  @State foo: number = 1
  @State objectLink: ClassA = new ClassA()

  build() {
    Row() {
      Bar ({
        childState: this.foo,
        childProp: this.foo,
        childLink: this.foo,
        childProvide: this.foo,
        childObjectLink: this.objectLink,
        childRegular: this.foo
      })
    }
  }
}

@Component
struct Bar {
  @State childState: number = 1;
  @PropRef childProp: number = 1;
  @Link childLink: number;
  @Provide childProvide: number = 1;
  @ObjectLink childObjectLink: ClassA;
  childRegular: number = 1;

  build() {
  }
}

@Observed
class ClassA {}