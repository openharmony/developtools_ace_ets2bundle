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
 * Test case: @Builder decorator restrictions
 * Purpose: Verify @Builder usage restrictions
 * Error codes: 10905108
 */

// ============================================
// Test Case 1: @Builder on variable
// Expected Error: 10905108
// ============================================

@Component
struct BuilderOnVariableError {
  // Error: @Builder on variable - 10905108
  @Builder builderVar: string = 'builder';
  
  @State message: string = 'Test';

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
    }
  }
}

// ============================================
// Test Case 2: @Builder on non-function
// ============================================

@Component
struct AnotherBuilderError {
  // Error: @Builder on property with number type - 10905108
  @Builder builderProp: number = 100;
  
  build() {
    Column() {
      Text('Builder Error')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Builder usage
// ============================================

@Builder
function correctBuilderFunction() {
  Column() {
    Text('Built Content')
      .fontSize(18)
  }
}

@Component
struct CorrectBuilderUsage {
  build() {
    Column() {
      correctBuilderFunction()
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct BuilderRestrictionTestEntry {
  build() {
    Column() {
      Text('@Builder Restriction Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Column() {
        Text('Testing: 10905108')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Builder on non-function')
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
