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

import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import { Text, TextAttribute, Column, Component, Button, ButtonAttribute, ClickEvent, UserView } from "@ohos.arkui.component"  // TextAttribute should be insert by ui-plugins
import { State, Link, StateDecoratedVariable, LinkDecoratedVariable,MutableState, stateOf, observableProxy } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import hilog from '@ohos.hilog'

function ArkUICompatible(init:(elmtId: number, instance: ESObject) => void, update: ((elmtId: number, instance: ESObject) => void)) {

}

@Component
struct MyStateSample {
  @State stateVar: string = "Parent";
  message: string = "var";
  changeValue() {
    this.stateVar+="~";
  }
  build() {
    Column(undefined) {
      Button("ParentChange").backgroundColor("#FFFF00FF")
        .onClick((e: ClickEvent) => {
          hilog.info(0x0000, 'testTag', 'On Click');
          this.changeValue();
        })
      Text(this.stateVar).fontSize(20)
      ChildLink({stateVar: this.stateVar, stateVar1: this.stateVar, stateVar2: ""} as __Options_ChildLink)
    }
  }
}

@Component
struct ChildLink {
  @Link stateVar: string = "Child";
  @State stateVar1: string = "Child";
  @Link stateVar2: string = "Child";
  changeValue() {
    this.stateVar+="~";
  }
  build() {
    Button("ChildChange").backgroundColor("#FFFF00FF")
      .onClick((e: ClickEvent) => {
        hilog.info(0x0000, 'testTag', 'On Click');
        this.changeValue();
      })
    Text(this.stateVar).fontSize(50)
  }
}

export class ComExampleTrivialApplication extends UserView {
  getBuilder() {
    hilog.info(0x0000, 'testTag', 'getBuilder');
    let wrapper = @memo () => {
      hilog.info(0x0000, 'testTag', 'MyStateSample');
      MyStateSample(undefined);
    }
    return wrapper;
  }
}