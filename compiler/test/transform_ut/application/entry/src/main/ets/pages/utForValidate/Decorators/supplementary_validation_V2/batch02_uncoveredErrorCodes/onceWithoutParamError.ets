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
 * Test: @Once decorator without @Param (must be used together)
 * Error code: 10905326
 */

@ComponentV2
struct OnceWithoutParam {
  @Local count: number = 0;
  @Once onceValue: number = 0;

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@Entry
@Component
struct TestOnceWithoutParam {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
