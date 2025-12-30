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

import { Entry, Component } from '@ohos.arkui.component';
import { Link, State, Provide } from "@ohos.arkui.stateManagement";

// Expected: '@Link' can only decorate member property.
// Expected: '@Provide' can only decorate member property.
// Actual: Property-only decorators are applied to global variable declarations.

@Entry
@Component
struct VariableValidationDemo {
  @State myState: number = 0;
  build() {}
}

@Link
let globalVariable: number = 10;

@Provide
const constantVariable: string = "test";