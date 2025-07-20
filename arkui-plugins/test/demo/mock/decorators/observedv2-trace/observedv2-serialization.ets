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

@Retention({policy: "SOURCE"})
export declare @interface TestDecor {}

@ObservedV2
class testJSONStringifyIgnore {
  var1: number = 1
  @Trace var2: number = 2
  @JSONStringifyIgnore var3: number = 3
  @TestDecor var4: number = 4
  @JSONStringifyIgnore @Trace var5: number = 5
  @JSONStringifyIgnore @TestDecor var6: number = 6
  @TestDecor @Trace var7: number = 7
  @JSONStringifyIgnore @TestDecor @Trace var8: number = 8
}

@ObservedV2
class testJsonRename {
  var1: number = 1
  @Trace var2: number = 2
  @JSONRename('name3') var3: number = 3
  @TestDecor var4: number = 4
  @JSONRename('name5') @Trace var5: number = 5
  @JSONRename('name6') @TestDecor var6: number = 6
  @TestDecor @Trace var7: number = 7
  @JSONRename('name8') @TestDecor @Trace var8: number = 8
}