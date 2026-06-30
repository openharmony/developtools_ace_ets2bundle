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
 * Static variable with built-in decorator
 */

@Component
struct StaticWithState {
  @State static staticCount: number = 0;
  count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}
@ComponentV2
struct StaticWithLocal {
  @Local static staticLocal: string = "test";
  value: string = "hello";
  build() { Column() { Text(this.value) } }
}

@Entry
@Component
struct DecoratorOnStaticEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
