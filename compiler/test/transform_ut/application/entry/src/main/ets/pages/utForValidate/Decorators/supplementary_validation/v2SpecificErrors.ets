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
 * Test case: V2 specific errors
 * Purpose: Verify @Param decorator requires default value or @Require
 * Error codes: 10905327
 * 
 * Background:
 * - In ArkTS V2, @Param variables must have default values
 * - Or they must be decorated with @Require
 * - This ensures proper initialization of component parameters
 */

// ============================================
// Test Case 1: @Param without default value and @Require
// Expected Error: 10905327
// ============================================

@ComponentV2
struct ParamWithoutRequire {
  // Error: @Param without default value and @Require - 10905327
  @Param value: string;
  @Param count: number;

  build() {
    Column() {
      Text(this.value)
        .fontSize(18)
      Text(`Count: ${this.count}`)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: Another struct with the same issue
// ============================================

@ComponentV2
struct AnotherParamError {
  @Param message: string;
  @Param isActive: boolean;

  build() {
    Column() {
      Text(this.message)
        .fontSize(16)
      Text(this.isActive ? 'Active' : 'Inactive')
        .fontSize(14)
    }
  }
}

// ============================================
// Test Case 3: Correct usage with @Require
// ============================================

@ComponentV2
struct CorrectParamUsage {
  @Param @Require requiredValue: string;
  @Param optionalValue: string = 'default';

  build() {
    Column() {
      Text(this.requiredValue)
        .fontSize(16)
        .fontColor(Color.Green)
      Text(this.optionalValue)
        .fontSize(14)
        .fontColor(Color.Blue)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct V2SpecificTestEntry {
  @State testStatus: string = 'Testing V2 Rules';

  build() {
    Column() {
      Text(this.testStatus)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905327')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Param without default value or @Require')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Correct usage example
      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('@Param @Require value: string')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('// OR')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text("@Param value: string = 'default'")
          .fontSize(12)
          .fontColor(Color.Green)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
