/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

// Test V1 component using V2 decorator - triggers 10905338
@Component
struct V1ComponentWithV2Decorator {
  @Local count: number = 0

  build() {
    Column() {
      Text("Count: " + this.count)
    }
  }
}

// Test V2 component using V1 decorator - triggers 10905339
@ComponentV2
struct V2ComponentWithV1Decorator {
  @State message: string = 'Hello'

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@Entry
@Component
struct TestV1V2Incompatibility {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
