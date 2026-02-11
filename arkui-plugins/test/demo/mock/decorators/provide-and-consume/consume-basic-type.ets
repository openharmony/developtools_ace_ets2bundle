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
import { Consume } from "@ohos.arkui.stateManagement"

@Component
struct PropParent {
  @Consume conVar1: string;
  @Consume conVar2: number;
  @Consume conVar3: boolean;
  @Consume conVar4: undefined;
  @Consume conVar5: null;
  @Consume conVar6?: undefined;
  @Consume conVar7?: null;
  @Consume conVar8: undefined = undefined;
  @Consume conVar9: null = null;
  @Consume conVar10?: null = null;
  @Consume conVar11?: undefined = undefined;
  @Consume('a') conVar12: number | undefined = undefined;
  @Consume('b') conVar13: string = 'hello';
  @Consume('c') conVar14?: boolean | null = true;
  @Consume('d') conVar15: undefined | null = null;
  @Consume('e') conVar16: undefined | null = undefined;
  @Consume('f') conVar17: number | string | null = 20;

  build() {
  }
}