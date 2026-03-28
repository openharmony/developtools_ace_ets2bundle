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
 * Test case: Duplicate decorators for method
 * Purpose: Verify duplicate decorators are not allowed for methods
 * Error code: 10905119
 */

// ============================================
// Test Case 1: Method with duplicate decorators
// Expected Error: 10905119
// ============================================
@Entry
@Component
struct DuplicateMethodDecorators {
  @State message: string = 'Test'

  // Error: Duplicate @Watch decorators
  @Watch('onMessageChange')
  @Watch('onMessageChange2')
  @State watchedValue: string = 'watched'

  onMessageChange() {
    console.info('Message changed')
  }

  onMessageChange2() {
    console.info('Message changed 2')
  }

  // Error: Method with duplicate decorators (if applicable)
  build() {
    Column() {
      Text(this.message)
        .fontSize(16)
    }
  }
}