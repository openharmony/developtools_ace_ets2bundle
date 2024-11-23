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
@Observed
class Info {
  count: number;
  constructor(count: number) {
    this.count = count;
  }
}

@Entry
@Component
struct Parent {
  @State $arr: Info = new Info(1);
  
  build() {
    Column() {
      Child({items: this.$arr});
    }
  }
}

@Component
struct Child {
  @ObjectLink items: Info;
  build() {
  }
}
`