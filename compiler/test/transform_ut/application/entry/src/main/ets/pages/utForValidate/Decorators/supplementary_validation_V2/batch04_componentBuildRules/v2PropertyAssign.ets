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
 * Test: V2 component property assignment from V1 parent
 * Target error codes: 10905323
 *
 * When a V1 @Component parent assigns a value to a V2 @ComponentV2
 * child's @Param property, certain type assignments are restricted.
 */

// Test 1: V1 parent assigning Observed class to V2 child @Param
@ObservedV2
class V2ObservedData {
  @Trace value: number = 0;
}

@ComponentV2
struct V2ChildComponent {
  @Param data: V2ObservedData = new V2ObservedData();

  build() {
    Column() {
      Text(this.data.value.toString())
    }
  }
}

@Component
struct V1ParentAssigning {
  @State sharedData: V2ObservedData = new V2ObservedData();

  build() {
    Column() {
      V2ChildComponent({ data: this.sharedData })
    }
  }
}

// Test 2: V1 parent assigning Function type to V2 child @Param
@ComponentV2
struct V2ChildWithFunction {
  @Param callback: () => void = () => {};

  build() {
    Column() {
      Text('Function param child')
    }
  }
}

@Component
struct V1ParentWithFunction {
  callbackFn: () => void = () => {};

  build() {
    Column() {
      V2ChildWithFunction({ callback: this.callbackFn })
    }
  }
}

// Test 3: V2 parent assigning to V2 child (control case - no error expected)
@ComponentV2
struct V2ParentValid {
  @Local data: V2ObservedData = new V2ObservedData();

  build() {
    Column() {
      V2ChildComponent({ data: this.data })
    }
  }
}

@Entry
@Component
struct TestV2PropertyAssign {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
