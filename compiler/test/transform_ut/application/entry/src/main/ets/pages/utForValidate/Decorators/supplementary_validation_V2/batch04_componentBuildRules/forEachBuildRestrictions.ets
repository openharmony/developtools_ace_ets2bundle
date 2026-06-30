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
 * Test: ForEach and LazyForEach build restrictions
 * Target error codes: 10905219, 10905220, 10905222
 *
 * Tests various component nesting rules within ForEach, LazyForEach,
 * and other build-time structural restrictions.
 */

// Test 1: ForEach with missing key generator (invalid usage)
@Component
struct ForEachMissingKey {
  @State items: number[] = [1, 2, 3];

  build() {
    Column() {
      ForEach(this.items, (item: number) => {
        Text(item.toString())
      })
    }
  }
}

// Test 2: Image component with children (not allowed)
@Component
struct ImageWithChildren {
  build() {
    Column() {
      Image($r('app.media.icon')) {
        Text('Child of Image - not allowed')
      }
    }
  }
}

// Test 3: Button with label parameter and children
@Component
struct ButtonLabelWithChildren {
  build() {
    Column() {
      Button('Button Label') {
        Text('Child of Button with label')
      }
    }
  }
}

// Test 4: Multiple root nodes in @Entry build
@Entry
@Component
struct MultipleRootNodes {
  build() {
    Text('Root 1')
    Text('Root 2')
  }
}

// Test 5: ForEach with correct usage (control case)
@Component
struct ValidForEach {
  @State items: number[] = [1, 2, 3];

  build() {
    Column() {
      ForEach(this.items, (item: number) => {
        Text(item.toString())
      }, (item: number) => item.toString())
    }
  }
}

@Entry
@Component
struct TestForEachRestrictions {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
