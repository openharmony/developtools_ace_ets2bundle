/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

exports.source = `
@Entry
@ComponentV2
struct createV1ComponentInV2 {
  value: string = "hello"
  objectLink_value: AA = new AA()
  build() {
    Column() {
      testChildV1({
        state_value: "hello",
        prop_value: "hello",
        link_value: this.value,
        provide_value: "hello",
        objectLink_value: this.objectLink_value
      })
    }
  }
}

@Component
struct testChildV1 {
  @State state_value: string = "hello"
  @Prop prop_value: string = "hello"
  @Link link_value: string
  @Provide provide_value: string = "hello"
  @ObjectLink objectLink_value: AA
  build() {}
}

@Observed
class AA {}
`