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
  @Trace num: number = 123;
  normalNum: number = 20;

  @Computed
  get AAA(): number {
    return 123;
  }

  get BBB(): number {
    return 123;
  }
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace num1: number = 123;

  @Computed
  get computedGetter(): number {
    return 123;
  }

  get computedGetter0(): number {
    return 123;
  }

  get normalGetter(): number {
    return 123;
  }

  get normalGetter0(): number {
    return 123;
  }
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();
  @Local count: number = 0;

  @Computed
  get structComputed(): number {
    return 123;
  }

  @Monitor(['testObj.computedGetter']) // OK
  test1(): void {}

  @Monitor(['testObj.computedGetter0']) // WARNING
  test2(): void {}

  @Monitor(['testObj.normalGetter']) // OK
  test3(): void {}

  @Monitor(['testObj.noExistGetter']) // ERROR
  test4(): void {}

  @Monitor(['structComputed']) // OK
  test5(): void {}

  @Monitor(['testObj.AAA']) // OK
  test6(): void {}

  @Monitor(['testObj.BBB']) // WARNING
  test7(): void {}

  build() {}
}
