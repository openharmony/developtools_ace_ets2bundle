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

interface User {
  name: string;
  id: number;
}

@ObservedV2
class UserClass implements User {
  name: string = '';
  @Trace id: number = 1;
}

@ObservedV2
class TestClassA {
  @Trace user1: UserClass = new UserClass();
  normalUser1: UserClass = new UserClass();
  @Trace data: number[] = [1, 2];

  @Computed get computedGetter0(): UserClass {
    return this.user1;
  }

  get normalGetter0(): UserClass {
    return this.normalUser1;
  }
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace user: UserClass = new UserClass();
  normalUser: UserClass = new UserClass();

  @Computed get computedGetter(): UserClass {
    return this.user1;
  }

  get normalGetter(): UserClass {
    return this.normalUser1;
  }
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor(['testObj.computedGetter.id']) // OK
  test1(): void {}

  @Monitor(['testObj.computedGetter.name']) // WARNING
  test2(): void {}

  @Monitor(['testObj.computedGetter0.id']) // OK
  test3(): void {}

  @Monitor(['testObj.computedGetter0.name']) // WARNING
  test4(): void {}

  @Monitor(['testObj.normalGetter.id']) // WARNING
  test5(): void {}

  @Monitor(['testObj.computedGetter.noExistField']) // ERROR
  test6(): void {}

  @Monitor(['testObj.noExistGetter.name']) // ERROR
  test7(): void {}

  build() {}
}
