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

import { ObservedV2, Trace } from "@ohos.arkui.stateManagement"

@ObservedV2
class CC {
  propB: number = 1
  @Trace traceB: number = 2
}

@ObservedV2
class DD {
  propB: number = 1
  @Trace traceE: number = 2
  @Trace tracef: number = 2
  vv: string
  constructor(vv1: string) {
    this.vv = vv1
  }
}