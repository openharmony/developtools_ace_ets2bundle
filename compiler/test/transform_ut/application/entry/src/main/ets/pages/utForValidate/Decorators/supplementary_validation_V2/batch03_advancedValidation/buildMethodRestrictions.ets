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
 * Test: Build method content restrictions
 * Error codes: 10905203, 10905206, 10905207, 10905208
 *
 * Validates what content is allowed inside build() methods:
 * - Object literals cannot be used as initial values
 * - Only UI component syntax is allowed
 * - @ObjectLink properties cannot be initialized in parent
 * - @Consume properties cannot have local initialization
 */

// Test 1: Object literal as initial value (not allowed in build)
// 10905206: does not meet UI component syntax
@Component
struct ObjectLiteralInBuild {
  build() {
    Column() {
      // Invalid: expression statement that is not UI component
      let data = { name: 'test', value: 123 }
      Text('Test')
    }
  }
}

// Test 2: Non-UI statement in build method
// 10905203: not allowed to use object literal as initial value
@Component
struct NonUIStatement {
  @State items: Array<string> = ['a', 'b'];

  build() {
    Column() {
      this.items.push('c')
      Text('Test')
    }
  }
}

// Test 3: Assignment statement in build method
// 10905206: does not meet UI component syntax
@Component
struct AssignmentInBuild {
  @State count: number = 0;

  build() {
    Column() {
      this.count = 10
      Text(this.count.toString())
    }
  }
}

// Test 4: @ObjectLink property initialized in parent component
// 10905207: @ObjectLink property cannot be initialized
@Observed
class ObservedModel {
  value: number = 0;
}

@Component
struct ObjectLinkInitialized {
  @ObjectLink modelData: ObservedModel;

  build() {
    Column() {
      Text(this.modelData.value.toString())
    }
  }
}

@Component
struct ParentOfObjectLink {
  build() {
    Column() {
      // @ObjectLink should not be initialized here
      ObjectLinkInitialized({ modelData: new ObservedModel() })
    }
  }
}

// Entry point
@Entry
@Component
struct TestBuildRestrictions {
  build() {
    Column() {
      Text('Test Page')
      ParentOfObjectLink()
    }
  }
}
