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
 * Test: V2 !! two-way binding with manual $Event assignment
 * Target error codes: 10905358
 *
 * When using !! two-way binding syntax, the framework auto-generates
 * the @Event handler. Manually assigning the $ event variable conflicts.
 */

// Test 1: !! binding with manual $event assignment
@ComponentV2
struct ChildComponent {
  @Param value: number = 0;
  @Event onValueChange: (n: number) => void = (n: number) => {};

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

@ComponentV2
struct TwoWayBindWithManualEvent {
  @Local value: number = 0;

  build() {
    Column() {
      ChildComponent({
        value: this.value!!,
        $onValueChange: (n: number) => { this.value = n; }
      })
    }
  }
}

// Test 2: !! binding with $event on different property
@ComponentV2
struct AnotherChild {
  @Param count: number = 0;
  @Event onCountChange: (n: number) => void = (n: number) => {};

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@ComponentV2
struct TwoWayBindConflict {
  @Local count: number = 42;

  build() {
    Column() {
      AnotherChild({
        count: this.count!!,
        $onCountChange: (n: number) => { this.count = n; }
      })
    }
  }
}

// Test 3: !! binding without manual event (control case)
@ComponentV2
struct ValidTwoWayBind {
  @Local value: number = 0;

  build() {
    Column() {
      ChildComponent({
        value: this.value!!
      })
    }
  }
}

@Entry
@Component
struct TestTwoWayEventAssign {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
