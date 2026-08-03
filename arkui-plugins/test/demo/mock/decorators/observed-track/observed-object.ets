
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

import { Text, Column, Component, Entry, Button, ClickEvent } from "@ohos.arkui.component"
import { State, Link, PropRef, Observed, Track } from "@ohos.arkui.stateManagement"
import hilog from '@ohos.hilog'

interface I {
  a: string;
  b: string;
}

@Observed
class CI implements I {
  a: string;
  b: string;

  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

@Observed
class CIRaw {
  a: string;
  b: string;
  constructor(a: string, b: string) {
    this.a = a;
    this.b = b;
  }
}

let a = 1;

@Entry
@Component
struct MyStateSample {
  @State i: I = { a: 'aaa', b: 'b' } as I;
  @State ci: CI = new CI('a', 'b');
  @State ciRaw: CIRaw = new CIRaw('a', 'b');
  build() {
    Column() {
      Button(`@State i.a: ${this.i.a}`).onClick((e: ClickEvent) => { this.i.a += 'a' })
      Button(`@State ci.a: ${this.ci.a}`).onClick((e: ClickEvent) => { this.ci.a += 'a' })
      Button(`@State ciRaw.a: ${this.ciRaw.a}`).onClick((e: ClickEvent) => { this.ciRaw.a += 'a' })
      LinkChild({ i: this.i, ci: this.ci, ciRaw: this.ciRaw })
    }.margin(10)
  }
}

@Component
struct LinkChild {
  @Link i: I;
  @Link ci: CI;
  @Link ciRaw: CIRaw;
  build() {
    Column() {
      Button(`@Link i.a: ${this.i.a}`).onClick((e: ClickEvent) => { this.i.a += 'a' })
      Button(`@Link ci.a: ${this.ci.a}`).onClick((e: ClickEvent) => { this.ci.a += 'a' })
      Button(`@Link ciRaw.a: ${this.ciRaw.a}`).onClick((e: ClickEvent) => { this.ciRaw.a += 'a' })
    }.margin(10)
  }
}
