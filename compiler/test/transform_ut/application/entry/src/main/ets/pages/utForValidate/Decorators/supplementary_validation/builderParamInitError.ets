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
 * Test case: @BuilderParam initialization error
 * Purpose: Verify @BuilderParam property must be initialized by @Builder function
 * Error codes: 10905107
 */

// ============================================
// Test Case 1: @BuilderParam initialized by non-Builder function
// Expected Error: 10905107
// ============================================

@Component
struct BuilderParamInitError {
  // Error: @BuilderParam initialized by regular string - 10905107
  @BuilderParam builder: () => void = 'not a builder function';
  
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: Another @BuilderParam with wrong initialization
// ============================================

@Component
struct AnotherBuilderParamError {
  // Error: @BuilderParam initialized by number - 10905107
  @BuilderParam customBuilder: () => void = 123;
  
  build() {
    Column() {
      Text('BuilderParam Error Test')
        .fontSize(18)
    }
  }
}

// ============================================
// Test Case 3: Correct @BuilderParam usage for comparison
// ============================================

@Builder
function correctBuilder() {
  Column() {
    Text('Built by Builder')
  }
}

@Component
struct CorrectBuilderParamUsage {
  // Correct: initialized by @Builder function
  @BuilderParam builder: () => void = correctBuilder;
  
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
struct BuilderParamInitTestEntry {
  @State testTitle: string = '@BuilderParam Init Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905107')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@BuilderParam must be initialized by @Builder function')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Rules
      Column() {
        Text('Rules:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('✓ @BuilderParam = @Builder function')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('✗ @BuilderParam = string/number/etc.')
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
