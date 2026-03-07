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
 * Test case: @Monitor in V1 component
 * Purpose: Verify @Monitor can only be used in @ComponentV2
 * Error code: 10905338
 */

@Component
struct MonitorInV1Test1 {
  @State count: number = 0

  @Monitor('count')
  onCountChange() {
    console.log('changed')
  }

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

@Component
struct MonitorInV1Test2 {
  @State message: string = ''

  @Monitor('message')
  onMessageChange() {
    console.log('msg changed')
  }

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@ComponentV2
struct CorrectMonitorV2 {
  @Local value: number = 0

  @Monitor('value')
  onValueChange() {
    console.log('value changed')
  }

  build() {
    Column() {
      Text('Monitor V2: ' + this.value)
    }
  }
}

@Entry
@Component
struct TestMonitorV2Error {
  @State title: string = '@Monitor V2 Error Test'

  build() {
    Column() {
      Text(this.title)
        .fontSize(24)
        .margin(20)
    }
  }
}
