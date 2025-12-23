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

import { Component, ComponentV2, Reusable, Column, Text } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: A main page configured in 'main_pages.json' or 'build-profile.json5' must declare exactly one component
// annotated with '@Entry' as its entry point.
// Actual: This main page file defines the 'EntryComponent' struct without any '@Entry' annotation, so the page 
// has no valid entry component.

@Component
struct EntryComponent{
  build(){
    Column(){
      Text('hello world')
    }
    .margin(10)
  }
}

@Component
struct OneEntrySummerpockets {
  build(){
  }
}