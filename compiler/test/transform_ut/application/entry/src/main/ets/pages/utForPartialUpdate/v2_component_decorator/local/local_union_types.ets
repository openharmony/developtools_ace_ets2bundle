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

// This test case is used to verify @Local union types.
@Entry
@ComponentV2
struct Index {
  @Local count: number | undefined = 10;

  build() {
    Column() {
      Text(`count(${this.count})`)
      Button("change to undefined")
        .onClick(() => {
          this.count = undefined;
        })
      Button("change to number")
        .onClick(() => {
          this.count = 10;
      })
    }
  }
}
