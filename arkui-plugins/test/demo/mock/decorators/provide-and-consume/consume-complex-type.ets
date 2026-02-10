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
import { Consume } from "@ohos.arkui.stateManagement"

class Per {
  num: number;
  constructor(num: number) {
    this.num = num;
  }
}

enum PropType {
  TYPE1 = 0,
  TYPE2 = 1,
  TYPE3 = 3
}

@Component
struct Parent {
  @Consume conVar1: Per;
  @Consume conVar2: Array<number>;
  @Consume conVar3: PropType;
  @Consume conVar4: Set<string>;
  @Consume conVar5: boolean[];
  @Consume conVar6: Array<Per>;
  @Consume conVar7: Per[];
  @Consume conVar8: (sr: string)=>void;
  @Consume conVar9: Date;
  @Consume conVar10: Map<number, Per>;
  @Consume conVar11: string | number;
  @Consume conVar12: Set<string> | Per;
  @Consume conVar13: Set<string> | null;
  @Consume('a') conVar14: Array<number> | undefined = new Array<number>(1, 2, 3);
  @Consume('b') conVar15: Set<string> = new Set<string>(new Array<string>('a', 'b', 'c'));
  @Consume('c') conVar16?: Per[] | null = [new Per(1), new Per(2), new Per(3)];
  @Consume('d') conVar17: Date | null = new Date('2026-02-09');
  @Consume('e') conVar18?: Map<string, Per> | null = new Map<string, Per>([['1', new Per(1)], ['2', new Per(2)]]);;
  @Consume('f') conVar19: Set<string> | Per | null = new Per(10);
  @Consume('g') conVar20: boolean[] | undefined = [true, false];

  build() {
  }
}