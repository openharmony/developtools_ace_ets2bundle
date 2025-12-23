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

import { Entry, Component } from '@ohos.arkui.component';
import { LocalStorageLink, StoragePropRef, Builder, Flex } from "@ohos.arkui.stateManagement";


// Expected: Properties decorated with '@StoragePropRef' cannot be assigned to regular properties
// in this parameter validation.
// Actual: 'value2' (@StoragePropRef) is assigned to 'title' (regular), which is a forbidden initialization.

@Component
struct TitleComp {
 title: string=''
  build() {
    Text(this.title)
  }
}

@Entry( { storage: "__get_local_storage__" } )
@Component
struct LinkComponent{
  @LocalStorageLink('local_storage_link_value')  value: string = 'hello world';
  @StoragePropRef('local_storage_prop_value') value2: string = 'hello world2';
  @Builder
  TitleCompView() {
    TitleComp({title: this.value2});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}