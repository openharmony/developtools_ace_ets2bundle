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
class BaseClass {
  @Trace baseState: string = '';
  baseNormal: number = 100;
}

@ObservedV2
class SubClass extends BaseClass {
  @Trace subState: boolean = true;
}

@ObservedV2
class SuperSubClass extends SubClass {
  @Trace qwe: string = '';
  normalExtend: string = '';
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: SuperSubClass = new SuperSubClass();

  @Monitor(['testObj.baseState']) // OK
  test1(): void {}

  @Monitor(['testObj.subState']) // OK
  test2(): void {}

  @Monitor(['testObj.baseNormal']) // WARNING
  test3(): void {}

  @Monitor(['testObj.normalExtend']) // WARNING
  test4(): void {}

  @Monitor(['testObj.extendNotExist']) // ERROR
  test5(): void {}

  build() {}
}
