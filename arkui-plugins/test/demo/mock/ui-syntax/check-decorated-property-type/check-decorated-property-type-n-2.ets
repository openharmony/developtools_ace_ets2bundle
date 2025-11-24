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

import { Entry, Text, Column, Component, CustomDialogController, ComponentV2, BuilderParam } from '@ohos.arkui.component'
import { State, Link, PropRef, Provide, Consume, ObjectLink, StoragePropRef, StorageLink, LocalStorageLink } from '@ohos.arkui.stateManagement'

@Component
struct StateComponent1 {
  // The '@State' property 'message1' cannot be a 'CustomDialogController' object.
  // The '@PropRef' property 'message2' cannot be a 'CustomDialogController' object.
  // The '@Link' property 'message3' cannot be a 'CustomDialogController' object.
  // The '@Provide' property 'message4' cannot be a 'CustomDialogController' object.
  // The '@Consume' property 'message5' cannot be a 'CustomDialogController' object.
  // The '@ObjectLink' property 'message6' cannot be a 'CustomDialogController' object.
  // The '@StoragePropRef' property 'message7' cannot be a 'CustomDialogController' object.
  // The '@StorageLink' property 'message8' cannot be a 'CustomDialogController' object.
  // The '@StoragePropRef' property 'message9' cannot be a 'CustomDialogController' object.
  // The '@LocalStorageLink' property 'message10' cannot be a 'CustomDialogController' object.
  @State message1: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @PropRef message2: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @Link message3: CustomDialogController;
  @Provide message4: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @Consume message5: CustomDialogController;
  @ObjectLink message6: CustomDialogController;
  @StoragePropRef('name') message7: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @StorageLink('name') message8: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @StoragePropRef('name') message9: CustomDialogController = new CustomDialogController({builder:()=>{}});
  @LocalStorageLink('name') message10: CustomDialogController = new CustomDialogController({builder:()=>{}});
  build() {
    Column(){
      Text('Hello')
    }
  }
}

@Entry
@ComponentV2
struct StateComponent {
  // The '@BuilderParam' property 'message' cannot be a 'CustomDialogController' object.
  @BuilderParam message: CustomDialogController = new CustomDialogController({builder:()=>{}});
  build() {
    Column(){
      Text('Hello')
    }
  }
}