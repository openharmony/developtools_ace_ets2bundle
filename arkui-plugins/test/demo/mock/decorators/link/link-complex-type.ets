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
import { Link } from "@ohos.arkui.stateManagement"

class Per {
  num: number;
  constructor(num: number) {
    this.num = num;
  }
}

enum LinkType {
  TYPE1 = 0,
  TYPE2 = 1,
  TYPE3 = 3
}

@Component
struct Parent {
  @Link linkVar1: Per;
  @Link linkVar2: Array<number>;
  @Link linkVar3: LinkType;
  @Link linkVar4: Set<string>;
  @Link linkVar5: boolean[];
  @Link linkVar6: Array<Per>;
  @Link linkVar7: Per[];
  @Link linkVar8: (sr: string)=>void;
  @Link linkVar9: Date;
  @Link linkVar10: Map<number, Per>;
  @Link linkVar11: string | number;
  @Link linkVar12: Set<string> | Per;

  build() {
  }
}