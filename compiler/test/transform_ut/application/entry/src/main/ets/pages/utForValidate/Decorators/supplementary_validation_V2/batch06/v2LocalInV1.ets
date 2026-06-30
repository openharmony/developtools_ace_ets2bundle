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
 * V2 @Local used in V1 @Component struct
 */

@Component
struct V1WithLocal {
  @Local count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}
@Component
struct V1WithParam {
  @Param value: string = "test";
  build() { Column() { Text(this.value) } }
}
@Component
struct V1WithEvent {
  @Event onChange: () => void = () => {};
  build() { Column() { Text("event") } }
}
@Component
struct V1WithComputed {
  @Local base: number = 10;
  @Computed get doubled(): number { return this.base * 2; }
  build() { Column() { Text("computed") } }
}

@Entry
@Component
struct V2LocalInV1Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
