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

import { Entry, ComponentV2, Column } from "@ohos.arkui.component"
import { Monitor, IMonitor, ObservedV2, Trace, Local } from "@ohos.arkui.stateManagement"

@ObservedV2
class Person {
  @Trace firstName: string = 'first';
  @Trace lastName: string = 'last';
}

@Entry
@ComponentV2
struct Index {
  @Local topArray: Person[][] = [];
  @Local arr: Person[] = [];
  @Local nums: number[] = [];

  // Valid: wildcard after named property and after array index
  @Monitor(["topArray.1.*", "topArray.*"])
  onTopArrayChange(monitor: IMonitor) {
  }

  // Valid: wildcard after array index on a one-dimensional array
  @Monitor(["arr.0.*"])
  onArrElementChange(monitor: IMonitor) {
  }

  // Invalid: unknown state variable, wildcard on primitive element,
  // wildcard in the middle of the path
  @Monitor(["nonExist.*", "nums.0.*", "arr.0.*.b"])
  onInvalidPaths(monitor: IMonitor) {
  }

  build() {
    Column() {
    }
  }
}
