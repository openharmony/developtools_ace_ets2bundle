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
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, or express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test: Struct decorator and naming validation
 * Error codes: 10905230, 10905234
 *
 * Validates struct-level decorator requirements:
 * - Structs used as components must have @Component/@ComponentV2/@CustomDialog
 * - Only valid decorators can be applied to structs
 */

// Test 1: Struct without any component decorator
// 10905230: Decorator is missing for struct
struct MissingDecorator {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Test 2: Struct with invalid decorator
// 10905234: Please use a valid decorator
@InvalidTestDecorator
struct InvalidDecoratorStruct {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Test 3: Another struct missing decorator with build method
struct AnotherMissingDecorator {
  count: number = 0;

  build() {
    Row() {
      Text(this.count.toString())
    }
  }
}

// Test 4: Struct with @State but no @Component
struct StateWithoutComponent {
  @State data: string = 'test';

  build() {
    Column() {
      Text(this.data)
    }
  }
}

// Test 5: Valid struct with @Component (control case)
@Component
struct ValidComponent {
  @State message: string = 'Valid';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Entry point
@Entry
@Component
struct TestStructValidation {
  build() {
    Column() {
      Text('Test Page')
      ValidComponent()
    }
  }
}
