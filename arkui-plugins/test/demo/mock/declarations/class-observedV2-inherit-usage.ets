/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { Text, Column, Component, ComponentV2, Entry, Builder, BuilderParam } from "@ohos.arkui.component"
import { Observed, ObservedV2, Track, Trace, Monitor, Computed, Local } from "@ohos.arkui.stateManagement";
import {
    IO,
    ExportObservedV2,
    ExportObservedV2Inherit,
    ExportObservedV2WithBody,
    ExportObservedV2InheritWithBody
} from "./utils/class-observedV2"

@ObservedV2
class SomeObV2Inherit extends ExportObservedV2 {
  @Trace t3: number = 1;

  @Monitor(['t1', 't3'])
  onT1Changed() {

  }
}

@ObservedV2
class SomeObV2TrInherit extends ExportObservedV2InheritWithBody {
  t2: number = 2;
  @Trace t3: number = 1;

  constructor(t2: number) {
    super(t2);
  }
}
