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

import { ComponentV2 } from "@ohos.arkui.component"
import { Local } from "@ohos.arkui.stateManagement"

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

@ComponentV2
struct Parent {
  @Local localVar1: Per = new Per(6);
  @Local localVar2: Array<number> = new Array<number>(3,6,8);
  @Local localVar3: StateType = StateType.TYPE3;
  @Local localVar4: Set<string> = new Set<string>(new Array<string>('aa', 'bb'));
  @Local localVar5: boolean[] = [true, false];
  @Local localVar6: Array<Per> = new Array<Per>(new Per(7), new Per(11));
  @Local localVar7: Per[] = [new Per(7), new Per(11)];
  @Local localVar9: Date = new Date('2025-4-23');
  @Local localVar10: Map<number, Per> = new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]);
  @Local localVar11: string | number = 0.0;
  @Local localVar12: Set<string> | Per = new Per(6);

  build() {
  }
}