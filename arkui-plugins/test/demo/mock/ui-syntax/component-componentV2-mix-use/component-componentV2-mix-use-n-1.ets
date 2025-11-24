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

import { ObservedV2, LocalStorage, Entry, Component, State, StorageLink, LocalStorageLink, StoragePropRef } from "@kit.ArkUI"

@ObservedV2
class Tmp {
  showValue: number = 0;
}

const __get_local_storage__ = () => new LocalStorage();

@Entry({ storage: "__get_local_storage__" })
@Component
struct MyComponent {
  @State state_val: Tmp = new Tmp();
  @StorageLink('storageLink') storageLink_val: Tmp = new Tmp();
  @LocalStorageLink('localStorageLink') localStorageLink_val: Tmp = new Tmp();
  @StoragePropRef('storagePropRef') storagePropRef_val: Tmp = new Tmp();
  build() {

  }
}