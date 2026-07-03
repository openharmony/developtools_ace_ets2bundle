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
 * Test: Component child restrictions
 * Error codes: 10905219, 10905221, 10905223
 *
 * Validates that certain container components enforce rules about
 * what child components they can contain, and under what conditions.
 */

// Test 1: ListItem must be nested inside List
// 10905219: component can only have specific child components
@Component
struct ListItemOutsideList {
  build() {
    Column() {
      ListItem() {
        Text('Item outside List')
      }
    }
  }
}

// Test 2: ListItemGroup must be inside List
@Component
struct ListItemGroupOutsideList {
  build() {
    Row() {
      ListItemGroup({ header: this.HeaderBuilder }) {
        ListItem() {
          Text('Group item')
        }
      }
    }
  }

  @Builder
  HeaderBuilder() {
    Text('Header')
  }
}

// Test 3: ForEach with no valid parent container
@Component
struct ForEachValidation {
  @State items: string[] = ['a', 'b', 'c'];

  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item)
      })
    }
  }
}

// Test 4: Multiple root nodes in build method
@Component
struct MultipleRootNodes {
  build() {
    Text('First root')
    Text('Second root')
  }
}

// Entry point
@Entry
@Component
struct TestComponentChildRestrictions {
  build() {
    Column() {
      Text('Test Page')
      ListItemOutsideList()
    }
  }
}
