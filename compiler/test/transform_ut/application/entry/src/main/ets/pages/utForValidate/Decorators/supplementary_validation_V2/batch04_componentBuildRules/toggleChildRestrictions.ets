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
 * Test: Toggle component child restrictions
 * Target error codes: 10905221, 10905223
 *
 * Toggle with certain types has restrictions on children:
 * - Some types can only have a single child
 * - Some types cannot have any children
 */

// Test 1: Toggle with Switch type and multiple children
@Component
struct ToggleSwitchMultipleChildren {
  build() {
    Column() {
      Toggle({ type: ToggleType.Switch, isOn: true }) {
        Text('Child 1')
        Text('Child 2')
      }
    }
  }
}

// Test 2: Toggle with Checkbox type and children
@Component
struct ToggleCheckboxWithChild {
  build() {
    Column() {
      Toggle({ type: ToggleType.Checkbox, isOn: true }) {
        Text('Child in Checkbox')
      }
    }
  }
}

// Test 3: Toggle with Button type and multiple children
@Component
struct ToggleButtonMultipleChildren {
  build() {
    Column() {
      Toggle({ type: ToggleType.Button, isOn: true }) {
        Text('Button Child 1')
        Text('Button Child 2')
      }
    }
  }
}

// Test 4: Toggle without children (control case)
@Component
struct ToggleWithoutChildren {
  build() {
    Column() {
      Toggle({ type: ToggleType.Switch, isOn: false })
    }
  }
}

// Test 5: Toggle with single child (control case)
@Component
struct ToggleWithSingleChild {
  build() {
    Column() {
      Toggle({ type: ToggleType.Button, isOn: true }) {
        Text('Single Child')
      }
    }
  }
}

@Entry
@Component
struct TestToggleRestrictions {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
