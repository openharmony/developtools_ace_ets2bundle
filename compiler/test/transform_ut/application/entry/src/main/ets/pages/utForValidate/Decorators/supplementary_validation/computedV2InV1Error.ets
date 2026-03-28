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
 * Test case: @Computed in V1 component
 * Purpose: Verify @Computed can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct ComputedInV1Test1 {
  @Computed
  get value(): number {
    return 10
  }

  build() {
    Column() {
      Text('Computed: ' + this.value)
    }
  }
}

@Component
struct ComputedInV1Test2 {
  @Computed
  get message(): string {
    return 'hello'
  }

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@ComponentV2
struct CorrectComputedV2 {
  @Local base: number = 5

  @Computed
  get doubled(): number {
    return this.base * 2
  }

  build() {
    Column() {
      Text('Doubled: ' + this.doubled)
    }
  }
}

@Entry
@Component
struct TestComputedV2Error {
  @State title: string = '@Computed V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
