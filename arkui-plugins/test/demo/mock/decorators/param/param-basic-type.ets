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

import { ComponentV2 } from "@ohos.arkui.component"
import { Param } from "@ohos.arkui.stateManagement"

@ComponentV2
struct Parent {
  @Param paramVar1: string = 'stateVar1';
  @Param paramVar2: number = 50;
  @Param paramVar3: boolean = true;
  @Param paramVar4: undefined = undefined;
  @Param paramVar5: null = null;

  build() {
  }
}