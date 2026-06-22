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

interface User1 {
  name: string;
  xxx: string;
  id: number;
}

interface User2 {
  name: string;
  id: number;
  zxc: number;
}

@ObservedV2
class ClassA {
  @Trace id: number = 1;
  name: string = '';
  @Trace age: number = 18;
  @Trace tom: number[] = [];
  @Trace tomm: number[] = [];
}

@ObservedV2
class ClassB {
  @Trace id: number = 2;
  name: string = '';
  @Trace sex: string = '';
}

@ObservedV2
class TestClassA {
  @Trace aaa: string = '';
  @Trace AAA: ClassA | ClassB = new ClassA();
  BBB: ClassA | ClassB = new ClassA();
  @Trace CCC: User1 | User2 = { name: '', xxx: '', id: 0 };
  DDD: User1 | User2 = { name: '', xxx: '', id: 0 };
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace unionAA: ClassA | ClassB = new ClassA();
  @Trace unionKK: (ClassA | ClassB)[] = [new ClassB()];
  unionBB: ClassA | ClassB = new ClassA();
  @Trace qwe: string = '';
  @Trace unionCC: User1 | User2 = { name: '', xxx: '', id: 0 };
  unionDD: User1 | User2 = { name: '', xxx: '', id: 0 };
  @Trace unionEE: ClassA | User1 | User2 = new ClassA();
  unionFF: ClassA | User1 | User2 = { name: '', xxx: '', id: 0 };
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor(['testObj.unionAA.id']) // OK
  test1(): void {}

  @Monitor(['testObj.unionAA.name']) // WARNING
  test2(): void {}

  @Monitor(['testObj.unionAB.noExistField']) // ERROR
  test3(): void {}

  @Monitor(['testObj.unionCC.id']) // WARNING
  test4(): void {}

  @Monitor(['testObj.unionDD.id']) // WARNING
  test5(): void {}

  @Monitor(['testObj.unionDD.aaa']) // ERROR
  test6(): void {}

  @Monitor(['testObj.unionEE.id']) // WARNING
  test7(): void {}

  @Monitor(['testObj.unionEE.name']) // WARNING
  test8(): void {}

  @Monitor(['testObj.unionEE.aaa']) // ERROR
  test9(): void {}

  @Monitor(['testObj.unionFF.id']) // WARNING
  test10(): void {}

  @Monitor(['testObj.unionFF.name']) // WARNING
  test11(): void {}

  @Monitor(['testObj.CCC.aaa']) // ERROR
  test12(): void {}

  @Monitor(['testObj.unionKK.aaa']) // ERROR
  test13(): void {}


  build() {}
}
