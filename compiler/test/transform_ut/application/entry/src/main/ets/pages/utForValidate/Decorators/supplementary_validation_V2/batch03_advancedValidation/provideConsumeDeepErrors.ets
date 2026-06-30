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
 * Test: V2 decorator deep validation errors
 * Error codes: 10905121, 10905116, 10905326
 *
 * Validates V2 decorator combinations and restrictions:
 * - Member property cannot be decorated by multiple built-in decorators
 * - @Computed can only decorate GetAccessor
 * - @Once must also be decorated with @Param
 */

// Test 1: @Event on non-Function type
// Should trigger error for @Event on non-Function variable
@ComponentV2
struct EventOnNonFunction {
  @Param count: number = 0;
  @Event onChange: number = 0;

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 2: @Param combined with @Local
// Should trigger error for combining @Param and @Local
@ComponentV2
struct ParamWithLocal {
  @Param @Local value: string = 'test';

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// Test 3: @Computed without getter
// Should trigger error for @Computed on non-accessor
@ComponentV2
struct ComputedWithoutGetter {
  @Local base: number = 10;
  @Computed computedValue: number = 20;

  build() {
    Column() {
      Text(this.computedValue.toString())
    }
  }
}

// Test 4: @Once without @Param in V2
// Should trigger error for @Once without @Param
@ComponentV2
struct OnceWithoutParam {
  @Once value: string = 'test';

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// Test 5: @Monitor observing @Computed property
// Should trigger error for monitoring computed property
@ComponentV2
struct MonitorOnComputed {
  @Local base: number = 10;

  @Computed
  get doubled(): number {
    return this.base * 2;
  }

  @Monitor('doubled')
  onDoubledChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.doubled.toString())
    }
  }
}

// Entry point
@Entry
@Component
struct TestV2DecoratorDeepErrors {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
