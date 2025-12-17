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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { LocalStorageLink, StoragePropRef } from "@ohos.arkui.stateManagement";

let storage = LocalStorage.getShared();

class EntryDecoParamClassA {
  public id: number = 1;
  public type: number = 2;
  public a: string = "aaa";
  constructor(a: string){
    this.a = a;
  }
}

// Expected: The '@Entry' decorator requires a parameter when '@LocalStorageLink' or '@StoragePropRef' is used.
// Actual: The rule reports an error because '@Entry' is missing a storage argument
// while local storage decorators are used.

@Entry
@Component
struct LocalStorageComponent {
  @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
  @StoragePropRef("storageObjectProp") objectName: EntryDecoParamClassA = new EntryDecoParamClassA("x");
  build() {
    Column() {
      Text(this.objectName.a)
        .onClick(()=>{
          this.simpleVarName +=1;
          this.objectName.a = this.objectName.a === 'x' ? 'yex' : 'no';
        })
    }
    .height(500)
  }
}