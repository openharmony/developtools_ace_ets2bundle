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
  Computed,
  ObservedArray,
  ObservedMap,
  ObservedSet
} from "@ohos.arkui.stateManagement"


@ObservedV2
class Person {
  @Trace name: string = '';
  @Trace age: number = 123;
}

@ObservedV2
class InfoList {
  @Trace personArr: Person[] = []
  @Trace dimensionTwo: number[][] = [[0, 0, 0], [1, 1, 1], [2, 2, 2]]
  @Trace dimensionThree: number[][][] = [[[0], [0], [0]], [[1], [1], [1]], [[2], [2], [2]]]

  @Monitor(['personArr.0.name'])
  test1() {}

  @Monitor(['dimensionTwo.0.0'])
  test2() {}

  @Monitor(['dimensionThree.0.0.0'])
  test3() {}
}
