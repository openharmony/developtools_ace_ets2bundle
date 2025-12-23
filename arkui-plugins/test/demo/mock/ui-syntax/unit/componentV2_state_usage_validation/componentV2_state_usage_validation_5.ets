/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component } from "@ohos.arkui.component";
import { Local, Param, Event } from "@ohos.arkui.stateManagement";

// Expected: '@Local', '@Param', or '@Event' can only decorate member property of a component struct.
// Actual: These decorators are applied to global functions, interfaces, and classes which is invalid.

@Local
function globalFunction() {}

@Param
interface UserInterface {
  name: string;
}

@Event
class StandardClass {
  id: number = 0;
}

@Entry
@Component
struct TestComponent {
  build() {}
}