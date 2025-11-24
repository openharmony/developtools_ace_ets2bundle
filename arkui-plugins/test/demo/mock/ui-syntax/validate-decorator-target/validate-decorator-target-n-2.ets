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

import { Entry, Component, Row, Column, Text, Reusable } from '@ohos.arkui.component'

// The '@Reusable' annotation can only be used with 'struct'.
@Reusable
let A: number = 0;

// The '@Reusable' annotation can only be used with 'struct'.
@Reusable
function B(){

}

// The '@Reusable' annotation can only be used with 'struct'.
@Reusable
class C {
  @Reusable
  A: number = 0;

  @Reusable
  funA(){

  }
}

// The '@Reusable' annotation can only be used with 'struct'.
@Reusable
interface IUser {
  name: string;
  age: number;
}

@Entry
@Component
struct Index {
  // The '@Reusable' annotation can only be used with 'struct'.
  @Reusable A: number = 0;

  // The '@Reusable' annotation can only be used with 'struct'.
  @Reusable
  funA(){

  }

  build() {
    Row() {
      Text('Hello World')
    }
  }
}