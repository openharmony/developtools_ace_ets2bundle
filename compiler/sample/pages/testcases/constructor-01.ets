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

class DataModel{
  private myData1: number = 0
}

@Entry
@Component
struct MyStateComponent {
  @State myState1: any = { count: 0 }
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'Home'
  @State myState5: DataModel = new DataModel()

  private myVar : number = 0
  private myVar2 : number

  build() {

  }
}
