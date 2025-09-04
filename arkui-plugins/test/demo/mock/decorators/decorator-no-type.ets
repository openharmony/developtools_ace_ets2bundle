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

import { Component, ComponentV2, CustomDialog } from "@ohos.arkui.component"
import { State, PropRef, Provide, Event, Local, Param } from "@ohos.arkui.stateManagement"
import { Provider, Consumer, Once, Observed, ObservedV2, Trace, Track } from "@ohos.arkui.stateManagement"

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

@ObservedV2
class OO {
  @Trace hi = '150'
}

@Observed
class RR {
  @Track hi = '150'
}

@Component
struct Parent {
  @State stateVar1 = new Per(6);
  @PropRef stateVar2 = new Array<number>(3, 6, 8);
  @Provide stateVar3 = StateType.TYPE3;
  stateVar8 = (sr: string) => {
  };
  stateVar9 = new Date('2025-4-23');
  @Provide({ alias: 'me0', allowOverride: false }) stateVar11113 = true;
  @Provide stateVar11114 = undefined;
  @State stateVar11115 = null;

  build() {
  }
}

@ComponentV2
struct V2Parent {
  @Once @Param stateVar4 = new Set<string>(new Array<string>('aa', 'bb'));
  @Local stateVar5 = [true, false];
  @Local stateVar6 = new Array<Per>(new Per(7), new Per(11));
  stateVar7 = [new Per(7), new Per(11)];
  @Event stateVar8 = (sr: string) => {
  };
  @Param stateVar9 = new Date('2025-4-23');
  @Param stateVar10 = new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]);
  @Once @Param stateVar11 = 0.0;
  @Provider stateVar12 = new Per(6);
  @Consumer stateVar11111 = 'stateVar1';
  @Provider('var') stateVar11188 = '';
  @Consumer('nihao') stateVar11112 = 50;

  build() {
  }
}

@CustomDialog
struct CC {
  @Once @Param stateVar4 = new Set<string>(new Array<string>('aa', 'bb'));
  @Local stateVar5 = [true, false];
  @Local stateVar6 = new Array<Per>(new Per(7), new Per(11));
  stateVar7 = [new Per(7), new Per(11)];
  @Event stateVar8 = (sr: string) => {
  };
  @Param stateVar9 = new Date('2025-4-23');
  @Param stateVar10 = new Map<number, Per>([[0, new Per(7)], [1, new Per(10)]]);
  @Once @Param stateVar11 = 0.0;
  @Provider stateVar12 = new Per(6);
  @Consumer stateVar11111 = 'stateVar1';
  @Provider('var') stateVar11188 = '';
  @Consumer('nihao') stateVar11112 = 50;

  build() {
  }
}