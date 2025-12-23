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

// Expected: A single ETS page file may contain at most one '@Entry' annotation; only one component can serve as 
// the entry point of the page.
// Actual: This file declares two components, 'ExceededEntrySummerpockets' and 'ExceededEntryEver17', both annotated 
//with '@Entry', resulting in multiple entry components in the same page.

@Entry
@Component
struct ExceededEntrySummerpockets {
  build(){

  }
}

@Entry
@Component
struct ExceededEntryEver17 {
  build(){

  }
}