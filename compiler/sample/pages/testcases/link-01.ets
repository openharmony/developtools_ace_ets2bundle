/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

@Component
struct MyLinkTestComponent {
  @Link myLink1?: any
  @Link myLink2?: number
  @Link myLink3?: boolean
  @Link myLink4?: string

  private myVar: number = 0
  private myVar2: number

  build() {

  }
}

@Entry
@Component
struct LinkTest {
  @State myState1: any = { count: 0 }
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'Home'

  build() {
    Row() {
      MyLinkTestComponent({
          myLink1: $myState1,
          myLink2: $myState2,
          myLink3: $myState3,
          myLink4: $myState4,
          myVar: 100,
          myVar2: 100,
      })
    }
  }
}
