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

import { Text, Column, ComponentV2, Entry, Button, ClickEvent } from "@ohos.arkui.component"
import { Local, Param, ObservedV2, Trace, Require } from "@ohos.arkui.stateManagement"
import hilog from '@ohos.hilog'

interface I {
  a: string;
  b: string;
}

@ObservedV2
class CI implements I {
  @Trace a: string;
  @Trace b: string;

  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

@ObservedV2
class CIRaw {
  @Trace a: string;
  @Trace b: string;
  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

let a = 1;

@Entry
@ComponentV2
struct MyStateSample {
  @Local i: I = { a: 'aaa', b: 'b' } as I;
  @Local ci: CI = new CI('a', 'b');
  @Local ciRaw: CIRaw = new CIRaw('a', 'b');
  build() {
    Column() {
      Button(`@Local i.a: ${this.i.a}`).onClick((e: ClickEvent) => { this.i.a += 'a' })
      Button(`@Local ci.a: ${this.ci.a}`).onClick((e: ClickEvent) => { this.ci.a += 'a' })
      Button(`@Local ciRaw.a: ${this.ciRaw.a}`).onClick((e: ClickEvent) => { this.ciRaw.a += 'a' })
      ParamChild({ i: this.i, ci: this.ci, ciRaw: this.ciRaw })
    }.margin(10)
  }
}

@ComponentV2
struct ParamChild {
  @Require @Param i: I;
  @Require @Param ci: CI;
  @Require @Param ciRaw: CIRaw;
  build() {
    Column() {
      Button(`@Param i.a: ${this.i.a}`).onClick((e: ClickEvent) => { this.i.a += 'a' })
      Button(`@Param ci.a: ${this.ci.a}`).onClick((e: ClickEvent) => { this.ci.a += 'a' })
      Button(`@Param ciRaw.a: ${this.ciRaw.a}`).onClick((e: ClickEvent) => { this.ciRaw.a += 'a' })
    }.margin(10)
  }
}
