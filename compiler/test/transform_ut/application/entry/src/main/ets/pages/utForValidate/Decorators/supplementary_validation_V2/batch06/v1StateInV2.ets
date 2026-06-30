/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * V1 @State used in V2 @ComponentV2 struct
 */

@ComponentV2
struct V2WithState {
  @State count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}
@ComponentV2
struct V2WithProp {
  @Prop message: string = "hello";
  build() { Column() { Text(this.message) } }
}
@ComponentV2
struct V2WithLink {
  @Link value: number;
  build() { Column() { Text(this.value.toString()) } }
}
@ComponentV2
struct V2WithProvide {
  @Provide data: string = "test";
  build() { Column() { Text(this.data) } }
}

@Entry
@Component
struct V1StateInV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
