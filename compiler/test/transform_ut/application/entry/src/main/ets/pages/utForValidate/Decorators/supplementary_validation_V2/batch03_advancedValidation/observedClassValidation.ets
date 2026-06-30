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
 * Test: @ObservedV2 and @Trace class validation
 * Error codes: 10905341, 10905342, 10905343, 10905344, 10905345
 *
 * Validates rules for class-level state management decorators:
 * - @Type cannot be used in @Observed class (use @ObservedV2 instead)
 * - @Type cannot be used in @Sendable class
 * - @Trace/@Type can only decorate members of @ObservedV2 class
 * - @Param/@Local etc. cannot be used in @ObservedV2 class
 */

// Test 1: @Type used inside @Observed class (should use @ObservedV2)
// 10905341: '@Type' cannot be used in a class decorated with '@Observed'
@Observed
class ObservedClassWithType {
  @Type(CustomSerializer) name: string = 'test';
}

class CustomSerializer {
  serialize(): string {
    return '';
  }
}

// Test 2: @Trace used outside of @ObservedV2 class
// 10905343: can only decorate member within a class decorated with '@ObservedV2'
class PlainClassWithTrace {
  @Trace value: number = 0;
}

// Test 3: @Param decorator used inside @ObservedV2 class
// 10905344: cannot be used with classes decorated by '@ObservedV2'
@ObservedV2
class ObservedV2ClassWithParam {
  @Param data: string = 'test';
}

// Test 4: @Local decorator used inside @ObservedV2 class
// 10905344: cannot be used with classes decorated by '@ObservedV2'
@ObservedV2
class ObservedV2ClassWithLocal {
  @Local count: number = 0;
}

// Test 5: @Trace can only decorate member variables, not methods
// 10905345: can decorate only member variables of a class
@ObservedV2
class ObservedV2WithTraceMethod {
  count: number = 0;

  @Trace
  getCount(): number {
    return this.count;
  }
}

// Entry point
@Entry
@Component
struct TestObservedV2Validation {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
