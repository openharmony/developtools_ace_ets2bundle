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
 * Test case: @Require in V1 component
 * Purpose: Verify @Require can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct RequireInV1Test1 {
  @Require value: number

  build() {
    Column() {
      Text('Require: ' + this.value)
    }
  }
}

@Component
struct RequireInV1Test2 {
  @Require name: string

  build() {
    Column() {
      Text(this.name)
    }
  }
}

@ComponentV2
struct CorrectRequireV2 {
  @Require mandatory: string

  build() {
    Column() {
      Text('Require V2: ' + this.mandatory)
    }
  }
}

@Entry
@Component
struct TestRequireV2Error {
  @State title: string = '@Require V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
