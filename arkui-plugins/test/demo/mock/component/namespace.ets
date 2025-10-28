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

import { Component, Column, Text } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

@Component
struct Main {
  build() {
    Column() {
        Text("123")
    }
  }
}

export namespace NS1{
  export let y1 = foo()
  export function foo() {return 1}
  export let x1 = foo()
  export class C {static z1 = 'z1'}
  @Component
  export struct Child {
  @State propVar: string = "Prop";
    build() {
      Column() {
        Text("123")
      }
    }
  }

  export namespace NS2 {
    export let s1 = 'hello'
    @Component
    struct NS2_struct {
        build() {
            Column() {
                Text("123")
            }
        }
    }
  }

  export namespace NS3 {
    export let s2 = 'world'
  }
}
