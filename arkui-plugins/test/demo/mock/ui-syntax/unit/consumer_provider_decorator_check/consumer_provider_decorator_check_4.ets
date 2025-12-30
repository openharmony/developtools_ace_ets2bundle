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

import { Entry, ComponentV2 } from '@ohos.arkui.component';
import { Provider, Consumer } from "@ohos.arkui.stateManagement";

// Expected: The '@Provider' and '@Consumer' decorators are restricted to 'struct'
// and cannot be used in a regular 'class'.
// Actual: The rule reports errors for properties in 'V2DecoratorInClass' because they are
// not inside a component struct.

@Entry
@ComponentV2
struct Test {
  build() {}
}
class V2DecoratorInClass {
  @Provider() provider_value: string = "hello";
  @Consumer() consumer_value: string = "hello";
}