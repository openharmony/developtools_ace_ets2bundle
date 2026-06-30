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
 * Test: @Computed property with a setter method
 * Error code: 10905130
 */

@ComponentV2
struct ComputedSetterError {
  @Local count: number = 0;

  @Computed
  get doubled(): number {
    return this.count * 2;
  }

  set doubled(value: number) {
    this.count = value / 2;
  }

  build() {
    Column() {
      Text(this.doubled.toString())
    }
  }
}

@Entry
@Component
struct TestComputedSetter {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
