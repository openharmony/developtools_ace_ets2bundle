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

import { Entry, Component, Color } from '@ohos.arkui.component'
import { ObjectLink, ObservedV2 } from '@ohos.arkui.stateManagement'

@ObservedV2
class ClassA {
  public a: string = "default";
}

@Component
struct ExampleComponent {
  // Boolean
  @ObjectLink flag1: boolean | undefined;

  // String
  @ObjectLink str1: string | undefined;

  // Number
  @ObjectLink num1: number | undefined;

  // BigInt
  @ObjectLink bigNum1: bigint | undefined;

  // StringLiteral
  @ObjectLink greeting1: "hello" | undefined;

  // BigIntLiteral
  @ObjectLink id1:  undefined;

  @ObjectLink myClass: ClassA | null;

  @ObjectLink undefined1: undefined | null;

  @ObjectLink null1: null | undefined;

  @ObjectLink any1: Any | undefined;

  @ObjectLink color1: Color

  build() {

  }
}

@Entry
@Component
struct MyComponent {
  build() {

  }
}