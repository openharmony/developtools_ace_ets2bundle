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

import { Component } from "@ohos.arkui.component"
import { Provide } from "@ohos.arkui.stateManagement"

@Component
struct Ancestors {
  @Provide count: string | undefined = 'Child0';
  @Provide({ alias: 'prov1' }) count1: string | undefined = 'Child1';
  @Provide({ alias: 'prov2', allowOverride: false }) count2: string | undefined = 'Child2';
  @Provide({ alias: 'prov3', allowOverride: true }) count3: string | undefined = 'Child3';
  @Provide({ allowOverride: false }) count4: string | undefined = 'Child4';
  @Provide({ allowOverride: true }) count5: string | undefined = 'Child5';
  @Provide({ alias: "",  allowOverride: true }) count6: string | undefined = 'Child6';
  @Provide({ alias: "" }) count7: string | undefined = 'Child7';

  build() {
  }
}