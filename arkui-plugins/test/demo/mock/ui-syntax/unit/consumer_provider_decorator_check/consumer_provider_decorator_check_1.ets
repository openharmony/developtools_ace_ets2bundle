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

import { Entry, Component, ComponentV2, Column, WindowSizeLayoutBreakpointInfo,
 Text, Row, Button } from '@ohos.arkui.component';
import { State, Provide, Consume, Local, Consumer, Provider, Require, Param } from "@ohos.arkui.stateManagement";

// Expected: Properties decorated with '@Consumer' or '@Provider' cannot be initialized externally in the constructor.
// Actual: The case violates the rule because 'localVar' and 'providerVar' are initialized in the constructor.

@Entry
@Component
struct MainPage {
  @State pageState: string = "main";
  @Provide @Consume @Local conflictedVar: string = "error";

  build() {
    Column() {
      ChildComponentV2({
        localVar: new WindowSizeLayoutBreakpointInfo(),
        providerVar: new WindowSizeLayoutBreakpointInfo()
      })
      ChildComponentV2();
    }
  }
}

@ComponentV2
struct ChildComponentV2 {
  @Consumer localVar: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Provider(`prov1`) providerVar: WindowSizeLayoutBreakpointInfo = new WindowSizeLayoutBreakpointInfo();
  @Consume('') consumedVar: string = 'consumeTest';
  @Require @Param paramOne: a;

  build() {
    Column() {
      Text("This is ChildComponentV2");
      Row() {
        Button("Action");
      }
    }
  }
}