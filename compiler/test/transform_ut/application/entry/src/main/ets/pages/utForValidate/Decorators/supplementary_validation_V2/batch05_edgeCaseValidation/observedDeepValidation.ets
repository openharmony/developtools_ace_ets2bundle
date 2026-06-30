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
 * Test: @Observed and @ObservedV2 class deep validation
 * Target: @Trace usage rules, @Type restrictions, inheritance conflicts
 */

// Test 1: @Trace on method inside @ObservedV2 (should be on variable only)
@ObservedV2
class TraceOnMethod {
  count: number = 0;

  @Trace
  getCount(): number {
    return this.count;
  }
}

// Test 2: @Type used inside @ObservedV2 (should use @Trace instead)
class Serializer {
  serialize(): string { return ''; }
}

@ObservedV2
class TypeInObservedV2 {
  @Type(Serializer) data: string = 'test';
}

// Test 3: @Observed class inheriting from @ObservedV2 class
@ObservedV2
class V2Base {
  @Trace value: number = 0;
}

@Observed
class V1Child extends V2Base {
  name: string = 'test';
}

// Test 4: @ObservedV2 class inheriting from @Observed class
@Observed
class V1Base {
  count: number = 0;
}

@ObservedV2
class V2Extended extends V1Base {
  @Trace label: string = 'test';
}

// Test 5: Class with both @Observed and @ObservedV2
@Observed
@ObservedV2
class DualObserved {
  value: number = 0;
}

// Test 6: @ObservedV2 with correct @Trace usage
@ObservedV2
class ValidObservedV2Class {
  @Trace name: string = 'valid';
  @Trace count: number = 42;
}

@Entry
@Component
struct TestObservedDeepValidation {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
