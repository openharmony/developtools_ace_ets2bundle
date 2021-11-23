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
struct Banner {
  private value1: string = "hello world 4"
  private value2: string = "hello world 5"
  private value3: string = "hello world 6"

  build() {
    Column() {
      Text(this.value1)
      Text(this.value2)
      Text(this.value3)
    }
  }
}

@Component
@Entry
struct MyComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"
  @State private idx:number = 0

  build() {
    Column() {
      Text(this.value1)
      Text(this.value2)
      Text(this.value3)
      Banner()
    }
  }
}
