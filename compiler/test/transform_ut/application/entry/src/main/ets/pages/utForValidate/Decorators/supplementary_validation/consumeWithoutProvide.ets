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
 * Test case: @Consume usage without @Provide
 * Purpose: Verify @Consume can only be used in child components of @Provide component
 * Error codes: 10905309
 */

// ============================================
// Test Case 1: @Consume without @Provide parent
// Expected Error: 10905309
// ============================================

@Component
struct ConsumeWithoutProvide {
  // Error: Using @Consume without @Provide parent - 10905309
  @Consume('theme') themeValue: string;
  
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: Another @Consume without @Provide
// ============================================

@Component
struct AnotherConsumeError {
  @Consume('data') dataValue: number;
  
  build() {
    Column() {
      Text('Consume Error')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Provide/@Consume usage
// ============================================

@Component
struct ParentWithProvide {
  @Provide('theme') theme: string = 'light';
  
  build() {
    Column() {
      ChildWithConsume()
    }
  }
}

@Component
struct ChildWithConsume {
  @Consume('theme') theme: string;
  
  build() {
    Column() {
      Text('Child with Consume')
        .fontColor(this.theme === 'light' ? Color.Black : Color.White)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct ConsumeProvideTestEntry {
  build() {
    Column() {
      Text('@Provide/@Consume Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Column() {
        Text('Testing: 10905309')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Consume without @Provide parent')
          .fontSize(14)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
