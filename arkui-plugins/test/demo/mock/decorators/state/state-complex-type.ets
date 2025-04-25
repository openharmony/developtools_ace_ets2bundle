/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Component } from "@ohos.arkui.component"
import { State} from "@ohos.arkui.stateManagement"

class Per {
  num: number;
  constructor(num: number) {
    this.num = num;
  }
}

enum StateType {
  TYPE1 = 0,
  TYPE2 = 1,
  TYPE3 = 3
}

@Component
struct Parent {
  @State stateVar1: Per = new Per(6);
  @State stateVar2: Array<number> = new Array<number>(3,6,8);
  @State stateVar3: StateType = StateType.TYPE3;
  @State stateVar4: Set<string> = new Set<string>(new Array<string>('aa', 'bb'));
  @State stateVar5: boolean[] = [true, false];
  @State stateVar6: Array<Per> = new Array<Per>(new Per(7), new Per(11));
  @State stateVar7: Per[] = [new Per(7), new Per(11)];
  @State stateVar8: (sr: string)=>void = (sr: string)=>{};
  @State stateVar9: Date = new Date('2025-4-23');
  @State stateVar10: Map<number, Per> = new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]);
  @State stateVar11: string | number = 0.0;
  @State stateVar12: Set<string> | Per = new Per(6);

  build() {
  }
}