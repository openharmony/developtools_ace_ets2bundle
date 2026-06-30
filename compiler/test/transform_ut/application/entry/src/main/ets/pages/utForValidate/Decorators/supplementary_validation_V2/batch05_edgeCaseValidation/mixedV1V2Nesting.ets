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
 * WITHOUT WARRANTIES OR CONDITIONS of ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test: V1/V2 mixed component nesting edge cases
 * Target: Cross-version decorator usage and component nesting
 */

// Test 1: V1 component with V2 child using V2-only decorators
@ComponentV2
struct V2ChildComponent {
  @Param value: number = 0;
  @Local internalState: string = 'child';

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

@Component
struct V1ParentWithV2Child {
  @State parentValue: number = 42;

  build() {
    Column() {
      V2ChildComponent({ value: this.parentValue })
    }
  }
}

// Test 2: V2 component with V1 child
@Component
struct V1ChildComponent {
  @Prop message: string = 'hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

@ComponentV2
struct V2ParentWithV1Child {
  @Local message: string = 'from parent';

  build() {
    Column() {
      V1ChildComponent({ message: this.message })
    }
  }
}

// Test 3: V2 component with @Computed and @Monitor
@ComponentV2
struct V2ComputedMonitor {
  @Local base: number = 10;
  @Local multiplier: number = 2;

  @Computed
  get result(): number {
    return this.base * this.multiplier;
  }

  @Monitor('base', 'multiplier')
  onBaseOrMultiplierChange() {
    console.log('values changed');
  }

  build() {
    Column() {
      Text(this.result.toString())
    }
  }
}

// Test 4: V1 component with @Watch (correct V1 usage)
@Component
struct V1WithWatch {
  @State @Watch('onValueChange') value: number = 0;

  onValueChange() {
    console.log('value changed');
  }

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// Test 5: V2 @ComponentReuse without parameters (correct V2 usage)
@ComponentV2
struct V2ComponentReuseValid {
  @Local count: number = 0;

  @ComponentReuse
  aboutToReuse() {
    console.log('reused');
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@Entry
@Component
struct TestMixedNesting {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
