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
 * Test case: @BuilderParam type error
 * Purpose: Verify @BuilderParam must be a function type
 * Error codes: 10905221
 */

// ============================================
// Test Case 1: @BuilderParam with string type
// Expected Error: 10905221
// ============================================

@Component
struct BuilderParamTypeError {
  // Error: @BuilderParam with string type - 10905221
  @BuilderParam builder: string = 'invalid';
  
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: @BuilderParam with number type
// ============================================

@Component
struct AnotherBuilderTypeError {
  // Error: @BuilderParam with number type - 10905221
  @BuilderParam builder: number = 100;
  
  build() {
    Column() {
      Text('Type Error')
        .fontSize(18)
    }
  }
}

// ============================================
// Test Case 3: Correct function type usage
// ============================================

@Builder
function sampleBuilder() {
  Text('Sample')
}

@Component
struct CorrectBuilderType {
  // Correct: function type
  @BuilderParam builder: () => void = sampleBuilder;
  
  build() {
    Column() {
      this.builder()
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct BuilderParamTypeTestEntry {
  build() {
    Column() {
      Text('@BuilderParam Type Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Column() {
        Text('Testing: 10905221')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@BuilderParam must be function type')
          .fontSize(14)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
    }
    .width('100%')
    .height('100%')
  }
}
