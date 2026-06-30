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
 * Test: @Computed property with $$ two-way binding syntax
 * Target error codes: 10905129
 *
 * A @Computed property is read-only and cannot be used with
 * the $$ two-way binding syntax.
 */

// Test 1: @Computed used with $$ syntax for V1 @Link binding
@Component
struct ChildLink {
  @Link value: number;
  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

@ComponentV2
struct ComputedTwoWayBind {
  @Local base: number = 10;

  @Computed
  get doubled(): number {
    return this.base * 2;
  }

  build() {
    Column() {
      ChildLink({ value: this.doubled$$ })
    }
  }
}

// Test 2: @Computed used with $$ in another context
@Component
struct AnotherChild {
  @Link count: number;
  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@ComponentV2
struct ComputedWithTwoWay {
  @Local items: number = 5;

  @Computed
  get squared(): number {
    return this.items * this.items;
  }

  build() {
    Column() {
      AnotherChild({ count: this.squared$$ })
    }
  }
}

// Test 3: @Computed without $$ binding (control case)
@ComponentV2
struct ValidComputedUsage {
  @Local base: number = 10;

  @Computed
  get doubled(): number {
    return this.base * 2;
  }

  build() {
    Column() {
      Text(this.doubled.toString())
    }
  }
}

@Entry
@Component
struct TestComputedTwoWay {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
