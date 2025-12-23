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

import { Component, ObservedV2, Column, Text } from '@ohos.arkui.component';
import { Provide, Consume } from "@ohos.arkui.stateManagement";

@ObservedV2
class ThemeManager {
  isDark: boolean = false;
}

// Expected: In this mixed-use validation, the '@Provide' decorator cannot be used with an '@ObservedV2' class type.
// Actual: The 'theme' property uses 'ThemeManager' (@ObservedV2), violating the restriction on mixing V1/V2 types.

@Component
struct RootComponent {
  @Provide theme: ThemeManager = new ThemeManager();

  build() {
    Column() {
      ChildNode()
    }
  }
}

// Expected: The '@Consume' decorator must not be applied to an '@ObservedV2' type in this mixed-use validation case.
// Actual: The 'theme' property is typed as 'ThemeManager', which is an '@ObservedV2' class, causing a violation.

@Component
struct ChildNode {
  @Consume theme: ThemeManager;

  build() {
    Column() {
      Text(this.theme.isDark ? "Dark Mode" : "Light Mode")
    }
  }
}