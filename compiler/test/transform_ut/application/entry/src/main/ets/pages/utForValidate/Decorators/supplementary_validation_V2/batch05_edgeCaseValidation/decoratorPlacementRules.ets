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
 * Test: Decorator placement and usage restrictions
 * Target: Various decorators used in wrong contexts
 */

// Test 1: @State used on a method (should be on property)
@Component
struct StateOnMethod {
  count: number = 0;

  @State
  getCount(): number {
    return this.count;
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 2: Duplicate @Monitor decorators on same method
@ComponentV2
struct DuplicateMonitor {
  @Local count: number = 0;

  @Monitor('count')
  @Monitor('count')
  onCountChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 3: @BuilderParam used with wrong initializer type
@Component
struct BuilderParamWrongInit {
  @BuilderParam content: () => void = (() => {
    console.log('not a builder');
  }) as () => void;

  build() {
    Column() {
      this.content()
    }
  }
}

// Test 4: @Concurrent used on an async function
@Concurrent
async function concurrentAsyncFunction(): Promise<void> {
  await Promise.resolve();
}

// Test 5: @BuilderParam with correct usage (control case)
@Builder
function validBuilderFunction() {
  Text('Valid')
}

@Component
struct ValidBuilderParamUsage {
  @BuilderParam content: () => void = validBuilderFunction;

  build() {
    Column() {
      this.content()
    }
  }
}

@Entry
@Component
struct TestDecoratorPlacement {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
