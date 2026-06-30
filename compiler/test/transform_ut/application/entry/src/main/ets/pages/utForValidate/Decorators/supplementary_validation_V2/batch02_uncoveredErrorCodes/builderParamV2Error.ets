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
 * Test: @BuilderParam in @ComponentV2 not initialized by @Builder
 * Error code: 10905107 (V2 variant)
 */

@Builder
function validBuilder() {
  Text('Builder Content')
}

@ComponentV2
struct BuilderParamV2Error {
  @BuilderParam myParam: () => void = (): void => {};

  build() {
    Column() {
      validBuilder()
    }
  }
}

@Entry
@Component
struct TestBuilderParamV2 {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
