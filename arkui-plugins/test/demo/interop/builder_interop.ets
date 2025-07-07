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


//  ArkTS1.2
'use static'
import { Entry, Text, Column, Component, Button, ClickEvent } from '@ohos.arkui.component'
import { State } from '@ohos.arkui.stateManagement'
import hilog from '@ohos.hilog'
import { demoBuilder1_1 } from 'har1'

@Entry
@Component
struct MyStateSample {
  @State stateVar: string = 'state var';
  message: string = 'var';

  build() {
    Column(undefined) {
      Text('Hello World').fontSize(20)
      Button(this.message).backgroundColor('#FFFF00FF')
        .onClick((e: ClickEvent) => {
          hilog.info(0x0000, 'testTag', 'On Click');
        })
      Text(this.stateVar).fontSize(20)
      demoBuilder1_1({ a:"a23", b:this.stateVar})
    }
  }
}


//ArkT1.1
@Builder
export function demoBuilder1_1( param1:aa) {

}
export class aa {
  a:string = ''
  b:string = ''
}


//transform 1.1 Builder to compatibleComponent

compatibleComponent((() => {
    let global = ESValue.getGlobal();
    let viewStackProcessor = global.getProperty("ViewStackProcessor");
    let createId = viewStackProcessor.getProperty("AllocateNewElmetIdForNextComponent");
    let elmtId = createId.invoke();
    let createCompatibleNode = global.getProperty("createCompatibleNodeWithFunc");
    let paramObject0 = ESValue.instantiateEmptyObject();
    paramObject0.setProperty("a", ESValue.wrap("a23"));
    paramObject0.setProperty("b", ESValue.wrap(this.stateVar));
    let component = createCompatibleNode.invoke(ESValue.wrap(demoBuilder1_1), elmtId, paramObject0);
    let builderViewClass = global.getProperty("getViewV2Class");
    let builderV2 = builderViewClass.invoke();
    let createFn = builderV2.getProperty("create");
    createFn.invoke(component);
    return {
        component: component,
        name: "demoBuilder1_1",
    };
}), ((instance: ESValue) => {
    let param = instance.getProperty("arg1");
    param.setProperty("a", ESValue.wrap("a23"));
    param.setProperty("b", ESValue.wrap(this.stateVar));
    let global = ESValue.getGlobal();
    let afterUpdateProperty = global.getProperty("afterUpdateProperty");
    afterUpdateProperty.invoke();
}));
