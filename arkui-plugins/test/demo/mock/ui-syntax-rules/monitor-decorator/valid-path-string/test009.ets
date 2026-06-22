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
class TestClass {
  @Trace userArr: UserClass[] = [new UserClass()];

  @Monitor(['userArr.0.name']) // WARNING
  test1(): void {}

  @Monitor(['userArr.0.id']) // OK
  test2(): void {}

  @Monitor(['userArr.0.noExistField']) // ERROR
  test3(): void {}
}


@Entry
@ComponentV2
struct MyStateSample {

  build() {}
}
