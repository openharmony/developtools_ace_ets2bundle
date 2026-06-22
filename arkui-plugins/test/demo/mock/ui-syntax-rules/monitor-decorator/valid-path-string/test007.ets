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
  @Trace aaa: string = '';
  bbb: number = 123;
  @Trace data: number[][] = [[1, 2], [3, 4]];
}

@ObservedV2
class TestClass extends TestClassA {
  @Trace twoDState: number[][] = [[1, 2], [3, 4]];
  twoDNormal: number[][] = [[5, 6], [7, 8]];
  oneDArray: number[] = [1, 2];
  @Trace www: TestClassA[][] = [[new TestClassA()], [new TestClassA()]];

  @Monitor(['twoDState']) // OK
  test1(): void {}

  @Monitor(['twoDState.length']) // OK
  test2(): void {}

  @Monitor(['twoDState.0.0']) // WARNING
  test3(): void {}
  
  @Monitor(['www.0.0.aaa']) // OK
  test4(): void {}

}

@Entry
@ComponentV2
struct MyStateSample {

  build() {}
}
