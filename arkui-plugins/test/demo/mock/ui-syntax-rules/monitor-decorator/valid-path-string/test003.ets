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
  Local 
} from "@ohos.arkui.stateManagement"

@ObservedV2
class TestClassB {
  @Trace AAA: string = '';
  BBB: number = 123;
}

@ObservedV2
class TestClassA extends TestClassB {
  @Trace aaa: string = '';
  bbb: number = 123;
}

@ObservedV2
class TestClass {
  @Trace classState: string = '';
  classNormal: boolean = true;
  @Trace a: TestClassA = new TestClassA();

  @Monitor(['classState']) // OK
  test1(): void {}

  @Monitor(['a.aaa']) // OK
  test2(): void {}

  @Monitor(['a.bbb']) // WARNING
  test3(): void {}

  @Monitor(['a.AAA']) // OK
  test4(): void {}

  @Monitor(['a.BBB']) // WARNING
  test5(): void {}

  @Monitor(['classNormal']) // WARNING
  test6(): void {}

  @Monitor(['classNotExist']) // ERROR
  test7(): void {}
}

@Entry
@ComponentV2
struct MyStateSample {

  build() {}
}
