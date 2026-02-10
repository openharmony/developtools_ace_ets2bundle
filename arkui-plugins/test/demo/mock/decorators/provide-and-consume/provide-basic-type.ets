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
struct PropParent {
  @Provide provideVar1: string = 'propVar1';
  @Provide provideVar2: number = 50;
  @Provide provideVar3: boolean = true;
  @Provide provideVar4: undefined = undefined;
  @Provide provideVar5: null = null;
  @Provide provideVar6: string | undefined = "hello";
  @Provide provideVar7: string | null = null;
  @Provide({ alias: 'a' }) provideVar8: number = 10;
  @Provide({ alias: 'b' }) provideVar9: string | undefined = 'hello';
  @Provide({ allowOverride: true }) provideVar10: number = 10;
  @Provide({ allowOverride: true }) provideVar11: string | undefined = undefined;
  @Provide({ allowOverride: false }) provideVar12: number = 15;
  @Provide({ allowOverride: false }) provideVar13: string | undefined = 'prop13';
  @Provide({ alias: 'c', allowOverride: true }) provideVar14: boolean | undefined = false;
  @Provide({ alias: 'd', allowOverride: true }) provideVar15: string | undefined = undefined;
  @Provide({ alias: 'e', allowOverride: false }) provideVar16: number | undefined = 20;
  @Provide({ alias: 'f', allowOverride: false }) provideVar17: boolean | undefined = true;

  build() {
  }
}