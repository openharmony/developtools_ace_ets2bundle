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
 * Test case: @Consumer in V1 component
 * Purpose: Verify @Consumer can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct ConsumerInV1Test1 {
  @Consumer('key1') value: string = ''

  build() {
    Column() {
      Text(this.value)
    }
  }
}

@Component
struct ConsumerInV1Test2 {
  @Consumer('key2') count: number = 0

  build() {
    Column() {
      Text('Consumer: ' + this.count)
    }
  }
}

@ComponentV2
struct CorrectConsumerV2 {
  @Consumer('shared') sharedData: string = ''

  build() {
    Column() {
      Text('Consumer V2')
    }
  }
}

@Entry
@Component
struct TestConsumerV2Error {
  @State title: string = '@Consumer V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
