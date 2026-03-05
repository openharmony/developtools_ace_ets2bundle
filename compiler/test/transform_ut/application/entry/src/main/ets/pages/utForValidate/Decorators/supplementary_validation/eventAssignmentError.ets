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
 * Test case: Event variable assignment error
 * Purpose: Verify @Event variable should not be assigned when using two-way binding
 * Error code: 10905358
 */

// ============================================
// Test Case 1: @Event with direct assignment
// Expected Error: 10905358
// ============================================
@Entry
@ComponentV2
struct EventAssignmentError {
  @Param value: number = 0
  @Event valueChange: (val: number) => void = (val) => {
    this.value = val
  }

  handleClick() {
    // Error: Do not assign value to @Event variable
    this.valueChange = (val) => console.log(val)
  }

  build() {
    Column() {
      Text('Value: ' + this.value)
        .onClick(() => this.handleClick())
    }
  }
}