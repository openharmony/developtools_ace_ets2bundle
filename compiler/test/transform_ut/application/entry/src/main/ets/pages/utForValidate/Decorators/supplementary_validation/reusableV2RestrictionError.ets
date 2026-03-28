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
 * Test case: @ReusableV2 on non-ComponentV2
 * Purpose: Verify @ReusableV2 can only be used with @ComponentV2
 * Error codes: 10905242
 * 
 * Background:
 * - @ReusableV2 is specifically designed for V2 components
 * - It cannot be used with @Component (V1)
 * - This ensures proper component reuse mechanism
 */

// ============================================
// Test Case 1: @ReusableV2 with @Component (V1)
// Expected Error: 10905242
// ============================================

// Error: @ReusableV2 with @Component - 10905242
@Component
@ReusableV2
struct ReusableV2OnV1 {
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: Another V1 with @ReusableV2
// ============================================

@Component
@ReusableV2
struct AnotherReusableV2OnV1 {
  @State data: string = 'Data';

  build() {
    Column() {
      Text(this.data)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @ReusableV2 with @ComponentV2
// ============================================

@ComponentV2
@ReusableV2
struct CorrectReusableV2Usage {
  @Local message: string = 'Correct Usage';

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Test Case 4: Correct @Reusable with @Component (V1)
// ============================================

@Component
@Reusable
struct CorrectReusableV1Usage {
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
// Entry point
// ============================================

@Entry
@Component
struct ReusableV2RestrictionTestEntry {
  @State testTitle: string = '@ReusableV2 Restriction Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905242')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Medium)
        
        Text('@ReusableV2 can only be used with @ComponentV2')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Rules section
      Column() {
        Text('Compatibility Rules:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)
        
        Text('✓ @ComponentV2 + @ReusableV2')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('✓ @Component + @Reusable')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('✗ @Component + @ReusableV2')
          .fontSize(12)
          .fontColor(Color.Red)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E3F2FD')
      .margin(10)
      
      // Note
      Column() {
        Text('Note:')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
        
        Text('@ReusableV2 requires V2 component architecture')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
