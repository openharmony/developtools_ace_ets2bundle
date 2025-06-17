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

@Retention({policy: "SOURCE"})
export declare @interface TestDecor {}

@Observed
class testJSONStringifyIgnore {
  var1: number = 1
  @Track var2: number = 2
  @JSONStringifyIgnore var3: number = 3
  @TestDecor var4: number = 4
  @JSONStringifyIgnore @Track var5: number = 5
  @JSONStringifyIgnore @TestDecor var6: number = 6
  @TestDecor @Track var7: number = 7
  @JSONStringifyIgnore @TestDecor @Track var8: number = 8
}

@Component
struct MyStateSample {
  build() {}
}
