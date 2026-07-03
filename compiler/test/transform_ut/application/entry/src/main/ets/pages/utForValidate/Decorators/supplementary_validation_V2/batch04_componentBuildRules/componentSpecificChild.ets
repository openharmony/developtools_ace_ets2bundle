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
 * Test: Component specific child restrictions
 * Target error codes: 10905219
 *
 * Certain components only allow specific child components.
 * Placing non-allowed children triggers an error.
 */

// Test 1: Grid with non-GridItem child
@Entry
@Component
struct GridWithInvalidChild {
  build() {
    Grid() {
      Text('Invalid child in Grid')
    }
  }
}

// Test 2: Grid with mixed valid and invalid children
@Component
struct GridWithMixedChildren {
  build() {
    Grid() {
      GridItem() {
        Text('Valid')
      }
      Text('Invalid - not GridItem')
    }
  }
}

// Test 3: ListColumn with invalid children (only allows specific children)
@Component
struct RowWithInvalidChild {
  build() {
    Column() {
      Text('Column child 1')
      Text('Column child 2')
    }
  }
}

// Test 4: Grid with correct GridItem children (control case)
@Component
struct GridWithValidChildren {
  build() {
    Grid() {
      GridItem() {
        Text('Valid GridItem 1')
      }
      GridItem() {
        Text('Valid GridItem 2')
      }
    }
  }
}

// Test 5: AlphabetIndexer with invalid child
@Component
struct AlphabetIndexerTest {
  build() {
    Row() {
      AlphabetIndexer({ arrayValue: ['A', 'B', 'C'], selected: 0 }) {
        Text('Invalid child')
      }
    }
  }
}

@Entry
@Component
struct TestComponentSpecificChild {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
