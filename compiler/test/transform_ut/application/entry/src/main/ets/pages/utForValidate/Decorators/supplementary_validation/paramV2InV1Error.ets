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
 * Test case: @Param in V1 component
 * Purpose: Verify @Param can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct ParamInV1Test1 {
  @Param value: number = 0

  build() {
    Column() {
      Text('Param in V1: ' + this.value)
    }
  }
}

@Component
struct ParamInV1Test2 {
  @Param message: string = 'Hello'

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@Component
struct ParamInV1Test3 {
  @Param flag: boolean = false

  build() {
    Column() {
      Text('Flag: ' + this.flag)
    }
  }
}

@ComponentV2
struct CorrectParamV2 {
  @Param data: string = 'test'

  build() {
    Column() {
      Text('V2 Param: ' + this.data)
    }
  }
}

@Entry
@Component
struct TestParamV2Error {
  @State title: string = '@Param V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
