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
 * Test: @Sendable and @Concurrent decorator validation
 * Target: @Sendable class restrictions, @Concurrent function restrictions
 */

// Test 1: @Concurrent used on a method (should be on function declaration)
@Component
struct ConcurrentOnMethod {
  @Concurrent
  concurrentMethod() {
    console.log('concurrent method');
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 2: @Concurrent used on a generator function
@Concurrent
function* concurrentGenerator() {
  yield 1;
  yield 2;
}

// Test 3: @Concurrent on correct function declaration
@Concurrent
function validConcurrentFunction(): void {
  console.log('valid concurrent');
}

// Test 4: @Type used inside @Sendable class (should not be allowed)
@Sendable
class SendableClassWithType {
  @Type(SendableClass) ref: SendableClass = new SendableClass();
}

// Test 5: @Trace used inside @Sendable class (should not be allowed)
@Sendable
class SendableClassWithTrace {
  @Trace value: number = 0;
}

// Test 6: @ObservedV2 class with correct @Trace usage
@ObservedV2
class ValidObservedV2 {
  @Trace count: number = 0;
}

@Entry
@Component
struct TestSendableConcurrent {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
