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
import { Observed, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: A class can be decorated with '@Observed' or '@ObservedV2', but not both simultaneously, 
// as these decorators are mutually exclusive.
// Actual: The class 'Demo2SettingsModel' applies '@ObservedV2' and '@Observed' together, which violates the rule 
// prohibiting the combined use of these decorators.

@Entry
@Component
struct Test {
  build() {
  }
}

@ObservedV2
@Observed
class Demo2SettingsModel {
  theme: "light" | "dark" = "light";
  language: string = "en";
  notificationsEnabled: boolean = true;

  constructor(theme?: "light" | "dark", language?: string) {
    if (theme) {
      this.theme = theme;
    }
    if (language) {
      this.language = language;
    }
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
  }

  setLanguage(lang: string) {
    this.language = lang;
  }

  disableNotifications() {
    this.notificationsEnabled = false;
  }

  enableNotifications() {
    this.notificationsEnabled = true;
  }
}