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

import { Component, Entry, Column, Text, ClickEvent } from "@ohos.arkui.component"
import { StorageLink, AppStorage } from "@ohos.arkui.stateManagement"

class Data {
  code: number;

  constructor(code: number) {
    this.code = code;
  }
}

AppStorage.setOrCreate('PropA', 47);
AppStorage.setOrCreate('PropB', new Data(50));

@Entry
@Component
struct Index {
  @StorageLink('PropA') storageLink: number = 1;
  @StorageLink('PropB') storageLinkObject: Data = new Data(1);

  build() {
    Column() {
      Text(`From AppStorage ${this.storageLink}`)
        .onClick((e: ClickEvent) => {
          this.storageLink += 1;
        })

      Text(`From AppStorage ${this.storageLinkObject.code}`)
        .onClick((e: ClickEvent) => {
          this.storageLinkObject.code += 1;
        })
      }
  }
}
