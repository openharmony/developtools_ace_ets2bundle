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
} from "./utils/class-observedV2";

class SomeObV2Class extends ExportObservedV2 implements IO {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObV2ClassImpl extends ExportObservedV2Inherit {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

const SomeObV2ClassVar = new SomeObV2Class(1);
const SomeObV2ClassImplVar = new SomeObV2ClassImpl(2);

const ExportObservedV2WithBodyVar = new ExportObservedV2WithBody(1);
const ExportObservedV2InheritWithBodyVar = new ExportObservedV2InheritWithBody(2);