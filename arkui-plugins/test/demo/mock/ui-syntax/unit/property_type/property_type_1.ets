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

import { Entry, Component, Column, Row } from '@ohos.arkui.component';
import { BuilderParam } from "@ohos.arkui.stateManagement";

// Expected: A '@BuilderParam' field must be initialized with a '@Builder' function or a '@Builder' method in a struct 
// (for example 'this.someBuilder' or 'StructName.someBuilder'), not with a plain value.
// Actual: In 'UpdateBuilderParamPropertyChild', the '@BuilderParam' property 'componentBuilder' is initialized with 
// the string literal 'Hello' instead of a '@Builder' function or method, so it violates the initialization rule
// for '@BuilderParam'.

@Component
struct UpdateBuilderParamPropertyChild {
  @BuilderParam componentBuilder: string = 'Hello';
  build() {
    Row() {}
  }
}

@Entry
@Component
struct UpdateBuilderParamPropertyParent {
  build() {
    Column() {
      UpdateBuilderParamPropertyChild()
    }
  }
}