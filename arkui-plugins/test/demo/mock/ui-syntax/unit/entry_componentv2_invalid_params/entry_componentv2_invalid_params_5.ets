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

import { Entry, ComponentV2, Column, Text } from '@ohos.arkui.component';
import { LocalStorage} from "@ohos.arkui.stateManagement";

// Expected: The '@Entry' decorator cannot use 'storage' or 'useSharedStorage' parameters with '@ComponentV2'.
// Actual: The rule reports an error because invalid storage options are passed to '@Entry' on a '@ComponentV2' struct.

@Entry({
  storage: new LocalStorage(),
  useSharedStorage: true
})
@ComponentV2
struct Demo5 {
  build() {
    Column() { 
      Text("Mixed Params Fail");
      }
  }
}