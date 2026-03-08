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
 * Test case: @Once in V1 component
 * Purpose: Verify @Once can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct OnceInV1Test1 {
  @Once value: string = 'once'

  build() {
    Column() {
      Text(this.value)
    }
  }
}

@Component
struct OnceInV1Test2 {
  @Once count: number = 1

  build() {
    Column() {
      Text('Once: ' + this.count)
    }
  }
}

@ComponentV2
struct CorrectOnceV2 {
  @Once initData: string = 'initialized'

  build() {
    Column() {
      Text('Once V2: ' + this.initData)
    }
  }
}

@Entry
@Component
struct TestOnceV2Error {
  @State title: string = '@Once V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
