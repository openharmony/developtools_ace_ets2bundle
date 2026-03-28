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
 * Test case: @Reusable and @ReusableV2 conflict
 * Purpose: Verify @Reusable and @ReusableV2 cannot be used simultaneously
 * Error codes: 10905241
 * 
 * Background:
 * - @Reusable is used for V1 component reuse
 * - @ReusableV2 is used for V2 component reuse
 * - These two decorators are mutually exclusive
 */

// ============================================
// Test Case 1: @Reusable and @ReusableV2 together
// Expected Error: 10905241
// ============================================

// Error: Using @Reusable and @ReusableV2 together - 10905241
@ComponentV2
@Reusable
@ReusableV2
struct ReusableConflict {
  @Local message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: Another conflict case
// ============================================

@Component
@Reusable
@ReusableV2
struct AnotherReusableConflict {
  @State data: string = 'Data';

  build() {
    Column() {
      Text(this.data)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Reusable usage (V1)
// ============================================

@Component
@Reusable
struct CorrectReusableV1 {
  @State message: string = 'V1 Reusable';

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Test Case 4: Correct @ReusableV2 usage
// ============================================

@ComponentV2
@ReusableV2
struct CorrectReusableV2 {
  @Local message: string = 'V2 Reusable';

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct ReusableConflictTestEntry {
  @State testTitle: string = '@Reusable Conflict Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905241')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Medium)
        
        Text('@Reusable and @ReusableV2 cannot be used together')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Rules section
      Column() {
        Text('Usage Rules:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)
        
        Text('✓ @Component + @Reusable (V1)')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('✓ @ComponentV2 + @ReusableV2 (V2)')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('✗ @Reusable + @ReusableV2 (Conflict)')
          .fontSize(12)
          .fontColor(Color.Red)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
