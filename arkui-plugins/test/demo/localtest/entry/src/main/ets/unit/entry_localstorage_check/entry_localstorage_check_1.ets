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
import { LocalStorageProp, LocalStorageLink, StorageProp, StorageLink, Consume } from "@ohos.arkui.stateManagement";

// Expected: The '@Entry' decorator requires a storage parameter when '@LocalStorageLink/Prop' is used in the component.
// Actual: The rule reports an error because '@Entry' is missing arguments while LocalStorage decorators are present.

@Entry
@Component
struct Child1struct03 {
  @LocalStorageProp("a") public local_prop_value: string = "hello";
  @LocalStorageLink("b") public local_link_value: string = "hello";
  @StorageProp("c") public storage_prop_value: string = "hello";
  @StorageLink("c") public storage_link_value: string = "hello";
  @Consume public consume_value: string;

  build() {}
}