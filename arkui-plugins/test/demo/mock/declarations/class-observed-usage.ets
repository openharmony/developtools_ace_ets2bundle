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
  ExportObserved, 
  ExportObservedImpl, 
  ExportObservedWithTrack, 
  ExportTrackWithoutObserved,
  ExportObservedWithBody,
  ExportObservedImplWithBody,
  ExportObservedWithTrackWithBody,
  ExportTrackWithoutObservedWithBody
} from "./utils/class-observed"

class SomeObClass extends ExportObserved implements IO {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObClassImpl extends ExportObservedImpl {
  someMethod(): void {
    console.log(this.t1);
  }

  constructor(t1: number) {
    super();
    this.t1 = t1;
  }
}

class SomeObClassWithTrack extends ExportObservedWithTrack {
  t1: number = 1;

  constructor(t2: number) {
    super();
    this.t2 = t2;
  }
}

class SomeTrClassInherit extends ExportTrackWithoutObserved {
  
}

const SomeObClassVar = new SomeObClass(1);
const SomeObClassImplVar = new SomeObClassImpl(2);
const SomeObClassWithTrackVar = new SomeObClassWithTrack(3);
const SomeTrClassInheritVar = new SomeTrClassInherit();

const ExportObservedWithBodyVar = new ExportObservedWithBody();
const ExportObservedImplWithBodyVar = new ExportObservedImplWithBody();
const ExportObservedWithTrackWithBodyVar = new ExportObservedWithTrackWithBody();
const ExportTrackWithoutObservedWithBodyVar = new ExportTrackWithoutObservedWithBody();