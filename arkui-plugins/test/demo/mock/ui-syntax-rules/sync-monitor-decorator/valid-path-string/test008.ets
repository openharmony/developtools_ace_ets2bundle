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
  SyncMonitor, 
  ObservedV2, 
  Trace, 
  Local,
  Computed
} from "@ohos.arkui.stateManagement"

@ObservedV2
class Person {
  @Trace pet: Dog = new Dog();
}

@ObservedV2
class Dog {
  @Trace age: number = 1;
}

@ObservedV2
class MyClass {
  @Trace per: Person = new Person();

  @SyncMonitor(["per.*.age"]) // ERROR
  test1() {}

  @SyncMonitor(["per.*.*"]) // ERROR
  test2() {}
}

@Entry
@ComponentV2
struct MyStateSample {

  build() {}
}
