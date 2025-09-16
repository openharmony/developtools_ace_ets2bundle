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
import { Observed, Track } from "@ohos.arkui.stateManagement"

class Info{}
class E {
  propE: Info = new Info()
  @Track trackE: Info = new Info()
}

@Observed
class E1 {
  propE1: Info = new Info()
  trackE1: Info = new Info()
}

@Component
struct MyStateSample {
  build() {}
}
