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
 * Test case: Consume initialization error
 * Purpose: Verify @Consume must be initialized using @Consume decorator with parameter
 * Error code: 10905307
 */

// ============================================
// Test Case 1: @Consume without decorator parameter
// Expected Error: 10905307
// ============================================
@Entry
@Component
struct ConsumeWithoutParam {
  @Consume consumedValue: string

  build() {
    Column() {
      Text(this.consumedValue)
    }
  }
}
