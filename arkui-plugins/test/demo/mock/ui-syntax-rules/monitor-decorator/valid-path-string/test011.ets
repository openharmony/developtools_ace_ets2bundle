/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { 
  Text, 
  Column, 
  ComponentV2, 
  Entry, 
  Button, 
  ClickEvent 
} from "@ohos.arkui.component"
import { 
  State, 
  Link, 
  PropRef, 
  Monitor, 
  ObservedV2, 
  Trace, 
  Local,
  Computed
} from "@ohos.arkui.stateManagement"

@ObservedV2
class TestClassA {
  @Trace stateSet0: Set<number> = new Set<number>([1, 2, 3]);
  normalSet0: Set<number> = new Set<number>([1, 2, 3]);
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace stateSet: Set<number> = new Set<number>([1, 2, 3]);
  normalSet: Set<number> = new Set<number>([1, 2, 3]);
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor(['testObj.stateSet']) // OK
  test1(): void {}

  @Monitor(['testObj.normalSet']) // WARNING
  test2(): void {}

  @Monitor(['testObj.stateSet.size']) // OK
  test3(): void {}

  @Monitor(['testObj.normalSet.size']) // WARNING
  test4(): void {}

  @Monitor(['testObj.normalSet.size.2']) // ERROR
  test5(): void {}

  @Monitor(['testObj.noExistSet.size']) // ERROR
  test6(): void {}

  @Monitor(['testObj.stateSet0.size']) // OK
  test7(): void {}

  @Monitor(['testObj.stateSet0.size.22']) // ERROR
  test8(): void {}

  @Monitor(['testObj.normalSet0.size']) // WARNING
  test9(): void {}

  build() {}
}
