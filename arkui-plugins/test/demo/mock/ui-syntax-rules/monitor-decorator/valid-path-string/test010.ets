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
  @Trace stateMap0: Map<string, number> = new Map<string, number>([['a', 1]]);
  normalMap0: Map<string, number> = new Map<string, number>([['a', 1]]);
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace stateMap: Map<string, number> = new Map<string, number>([['a', 1]]);
  normalMap: Map<string, number> = new Map<string, number>([['a', 1]]);
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor(['testObj.stateMap.size']) // OK
  test1(): void {}

  @Monitor(['testObj.normalMap.size']) // WARNING
  test2(): void {}

  @Monitor(['testObj.stateMap0.size']) // OK
  test3(): void {}

  @Monitor(['testObj.normalMap0.size.3']) // ERROR
  test4(): void {}

  @Monitor(['testObj.noExistMap.size']) // ERROR
  test5(): void {}

  build() {}
}
