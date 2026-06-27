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

enum MonitorEnum {
  MAP_STATE_VAR = 'testObj.stateVar',
  MAP_NORMAL_VAR = 'testObj.normalVar',
  MAP_NOT_EXIST = 'testObj.noExistVar'
}

@ObservedV2
class TestClass {
  @Trace stateVar: string = '';
  normalVar: number = 123;
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local testObj: TestClass = new TestClass();

  @Monitor([MonitorEnum.MAP_STATE_VAR]) // OK
  test1(): void {}

  @Monitor([MonitorEnum.MAP_NORMAL_VAR]) // WARNING
  test2(): void {}

  @Monitor([MonitorEnum.MAP_NOT_EXIST]) // ERROR
  test3(): void {}

  build() {}
}
