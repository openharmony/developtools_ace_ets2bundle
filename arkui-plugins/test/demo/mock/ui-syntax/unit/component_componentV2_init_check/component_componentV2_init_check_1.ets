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

import { Component, ComponentV2, Column, Text} from '@ohos.arkui.component';
import { Local, Link } from "@ohos.arkui.stateManagement";

// Expected: A '@ComponentV2' struct cannot use a V1 component that has '@Link' properties.
// Actual: 'V2ComponentUsingV1' uses 'V1ComponentWithLink', which has '@Link', violating this V2 restriction.

@Component
struct V1ComponentWithLink {
  @Link message: string;

  build() {
    Text(this.message)
  }
}

@ComponentV2
struct V2ComponentUsingV1 {
  @Local message: string = 'Hello';

  build() {
    Column() {
      V1ComponentWithLink({ message: this.message })
    }
  }
}
