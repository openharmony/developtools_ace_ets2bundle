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

import { Entry, Component, Column } from '@ohos.arkui.component';
import { Event, Provider, Consumer, Monitor, Computed } from "@ohos.arkui.stateManagement";

// Expected: New V2 decorators such as '@Event', '@Provider', and '@Consumer' must only be used inside structs that are 
// annotated with '@ComponentV2'.These decorators are not allowed in components that still use the legacy
// '@Component' (V1) decorator.
// Actual: The struct 'v2DecoratorInComponent' is decorated with '@Component' (V1), but its members use several 
// V2 decorators—including '@Event', '@Provider', and '@Consumer'. This means V2 field decorators are being
// used inside a V1 component, which violates the separation rule between old (V1) and new (V2) decorators.

@Entry
@Component
struct v2DecoratorInComponent {
  @Event event: () => void = () => {}
  @Provider() provider_value: string = "hello";
  @Consumer() consumer_value: string = "hello";

  build() {
    Column() {}
  }
}