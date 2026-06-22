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

import { Text, Column, Component, ComponentV2, Entry, Reusable, ReusableV2, ReusePoolOwnership } from "@ohos.arkui.component"
import { Observed, Link, State, StoragePropRef, LocalStoragePropRef, ObjectLink, Provide, Consume, PropRef, Watch } from "@ohos.arkui.stateManagement"

@Observed
class MyClassB {
}

@Entry
@Component({ reusePool: ReusePoolOwnership.SHARED, poolAccepts: ['ComA', 'ComB'] })
struct Index {
  build() {
    Column() {
    }
  }
}

@Reusable
@Component
struct ComA {
  @Link linkVar: number;
  @State str: string = 'aaa';
  @StoragePropRef('appTheme') prop1: string = 'bbb';
  @LocalStoragePropRef('localTheme') prop2: string = 'ccc';
  @ObjectLink objLinkVar: MyClassB;
  @Provide({ alias: 'alias' }) provideVar: string = 'ddd';
  @PropRef propVar1: string;
  @PropRef propVar2: string = 'eee';

  @Consume consumeVar1: string;
  @Consume({ alias: 'alias' }) consumeVar2: string;
  @Consume({ alias: 'alias' }) @Watch('onVarChange') consumeVar3: string = 'default';
  @Consume({ alias: 'alias' }) @Watch('onVarChange') consumeVar4: string;
  @Consume({ alias: 'alias' }) consumeVar5: string = 'default';

  onVarChange(var: string) {
  }

  build() {
    Column() {}
  }
}

@ReusableV2
@ComponentV2
struct ComB {
  build() {
    Column() {}
  }
}