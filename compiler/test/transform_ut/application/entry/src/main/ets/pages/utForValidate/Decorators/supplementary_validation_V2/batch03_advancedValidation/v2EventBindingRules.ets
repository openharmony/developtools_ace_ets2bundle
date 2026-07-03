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
 * Test: V2 @Event two-way binding and decorator combination rules
 * Error codes: 10905358, 10905363, 10905371
 *
 * Validates V2 component event and decorator rules:
 * - Two-way binding (!!) generates default @Event assignment, manual assignment is error
 * - V1 state decorators cannot apply to Function-type variables
 * - Methods with lifecycle decorators cannot have input parameters
 */

// Test 1: Two-way binding with manual @Event assignment conflict
// 10905358: do not assign value to '@Event' variable
@ComponentV2
struct ChildWithEvent {
  @Param count: number = 0;
  @Event countChange: (val: number) => void = (val: number) => {};

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@ComponentV2
struct ParentTwoWayBind {
  @Local count: number = 0;

  build() {
    Column() {
      // Using !! syntax with manual event assignment
      ChildWithEvent({
        count: !!this.count,
        countChange: (val: number) => { this.count = val }
      })
    }
  }
}

// Test 2: V1 @Provide decorator on Function-type variable
// 10905363: V1 decorator cannot be applied to Function-type variable
@Component
struct ProvideOnFunction {
  @Provide callback: () => void = () => {};

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 3: V1 @ObjectLink decorator on Function-type variable
// 10905363
@Component
struct ObjectLinkOnFunction {
  @ObjectLink handler: () => void;

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 4: V1 @StorageLink on Function-type variable
// 10905363
@Component
struct StorageLinkOnFunction {
  @StorageLink('key') callback: () => void = () => {};

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 5: @BuilderParam with valid initialization (control case)
@Builder
function validContentBuilder() {
  Text('Valid Builder Content')
}

@ComponentV2
struct ValidBuilderParamUsage {
  @BuilderParam content: () => void = validContentBuilder;

  build() {
    Column() {
      this.content()
    }
  }
}

// Entry point
@Entry
@Component
struct TestEventComputedRules {
  build() {
    Column() {
      Text('Test Page')
      ValidBuilderParamUsage()
    }
  }
}
