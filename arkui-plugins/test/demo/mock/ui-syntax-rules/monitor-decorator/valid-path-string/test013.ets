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
class ClassA {
  @Trace id: number = 1;
  name: string = '';
}

@ObservedV2
class ClassB {
  @Trace id: number = 1;
  name: string = '';
}

@ObservedV2
class TestClassA {
  @Trace unionANull0: ClassB | undefined | null = new ClassB();
  unionANull00: ClassB | undefined | null = new ClassB();
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace unionANull: ClassA | undefined | null = new ClassA();
  @Trace qwe: string = '';
}


@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor(['testObj.unionANull.id']) // OK
  test1(): void {}

  @Monitor(['testObj.unionANull.name']) // WARNING
  test2(): void {}

  @Monitor(['testObj.unionANull.noExistField']) // ERROR
  test3(): void {}


  build() {}
}
