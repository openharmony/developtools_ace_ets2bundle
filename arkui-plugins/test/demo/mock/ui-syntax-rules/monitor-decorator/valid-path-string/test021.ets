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
class Persion {
  @Trace tag: string = '';
}

@Entry
@ComponentV2
struct MyStateSample {
  @Local persion1: ObservedArray<Persion> = new ObservedArray<Persion>();
  @Local map1: ObservedMap<string, Persion> = new ObservedMap<string, Persion>();
  @Local set1: ObservedSet<Persion> = new ObservedSet<Persion>();

  @Monitor(['persion1.0.tag']) // OK
  test1(): void {}

  @Monitor(['persion1.length']) // OK
  test2(): void {}

  @Monitor(['map1.size']) // OK
  test3(): void {}

  @Monitor(['set1.size']) // OK
  test4(): void {}

  build() {}
}
