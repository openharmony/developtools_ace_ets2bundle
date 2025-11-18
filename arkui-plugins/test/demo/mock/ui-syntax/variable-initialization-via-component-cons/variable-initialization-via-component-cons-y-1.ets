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

import { Entry, Row, Component, Builder, BuilderParam } from '@ohos.arkui.component'
import { State, Provide, Require, PropRef, StoragePropRef, StorageLink, Consume, LocalStorageLink } from '@ohos.arkui.stateManagement'

@Entry
@Component
struct Index {
  @State message: string = 'Hello';
  build() {
    Row() {
      Child({
        initBuildText: buildFunction,
        messageProp: this.message,
        initMessage: this.message,
        messageState: this.message,
        messageProvide: this.message
      })
    }
  }
}
@Component
struct Child {
  @Require @BuilderParam initBuildText: () => void = buildFunction;
  @Require @PropRef messageProp: string = 'Hello';
  @Require @PropRef initMessage: string;
  @Require @State messageState: string = 'Hello';
  @Require @Provide messageProvide: string = 'Hello';
  @StoragePropRef('111') messageStoragePropRef: string = 'Hello';
  @StorageLink('111') messageStorageLink: string = 'Hello';
  @Consume('111') messageConsume: string = 'Hello';
  @LocalStorageLink('111') messageLocalStorageLink: string = 'Hello';
  build() {
  }
}
@Builder
function buildFunction() {
}