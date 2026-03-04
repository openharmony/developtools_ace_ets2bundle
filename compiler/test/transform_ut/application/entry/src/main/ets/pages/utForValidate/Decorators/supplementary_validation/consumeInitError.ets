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
 * Test case: @Consume initialization error
 * Purpose: Verify @Consume must use $ syntax for initialization
 * Error codes: 10905307
 */

// ============================================
// Test Case 1: @Consume with regular initialization
// Expected Error: 10905307
// ============================================

@Component
struct ConsumeInitError {
  // Error: @Consume with regular initialization - 10905307
  @Consume('theme') theme: string = 'light';
  
  build() {
    Column() {
      Text('Consume Init Error')
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: Another @Consume with wrong init
// ============================================

@Component
struct AnotherConsumeInitError {
  @Consume('data') data: number = 0;
  
  build() {
    Column() {
      Text('Another Error')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Consume usage
// ============================================

@Component
struct ParentProvide {
  @Provide('theme') theme: string = 'dark';
  
  build() {
    Column() {
      CorrectConsumeChild()
    }
  }
}

@Component
struct CorrectConsumeChild {
  // Correct: No initialization, uses $ syntax implicitly
  @Consume('theme') theme: string;
  
  build() {
    Column() {
      Text('Correct Consume')
        .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct ConsumeInitTestEntry {
  build() {
    Column() {
      Text('@Consume Init Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Column() {
        Text('Testing: 10905307')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Consume with regular initialization')
          .fontSize(14)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
