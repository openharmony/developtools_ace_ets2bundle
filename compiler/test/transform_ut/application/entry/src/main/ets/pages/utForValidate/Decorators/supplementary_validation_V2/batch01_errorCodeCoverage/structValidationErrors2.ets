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

// Test struct without name - triggers 10905232
// This is a syntax error test case
// Note: This would be caught at parser level

// Test missing component decorator - triggers 10905230
struct StructWithoutComponentDecorator {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Test invalid decorator - triggers 10905234
@InvalidDecorator
@Component
struct StructWithInvalidDecorator {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@Entry
@Component
struct TestStructValidation {
  build() {
    Column() {
      Text('Test')
    }
  }
}
