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
 * Test case: @Env decorator errors
 * Purpose: Verify @Env can only be used with specific environment types
 * Error codes: 10905251, 10905304
 * 
 * Background:
 * - @Env is used to access system environment information
 * - Only specific types are allowed: WindowSizeLayoutBreakpointInfo, Size, etc.
 * - @Env properties cannot have default values
 */

// ============================================
// Test Case 1: @Env with invalid type
// Expected Error: 10905251, 10905304
// ============================================

@Component
struct EnvWrongType {
  // Error: @Env with wrong type - 10905251
  // Error: @Env with default value - 10905304
  @Env invalidEnv: string = 'test';
  @Env anotherInvalid: number = 123;

  build() {
    Column() {
      Text(this.invalidEnv)
        .fontSize(18)
      Text(`${this.anotherInvalid}`)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: Another struct with @Env errors
// ============================================

@Component
struct AnotherEnvError {
  @Env wrongEnv1: boolean = false;
  @Env wrongEnv2: Object = {};

  build() {
    Column() {
      Text('Env Error Test')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Env usage
// ============================================

@Component
struct CorrectEnvUsage {
  // Correct: Using valid Env type without default value
  // Note: This would work with actual Env types in a real app
  @State correctEnv: string = '';

  build() {
    Column() {
      Text('Correct Usage')
        .fontSize(16)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct EnvDecoratorTestEntry {
  @State testTitle: string = '@Env Decorator Test';

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905251, 10905304')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Env with invalid type or default value')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // Rules section
      Column() {
        Text('Valid @Env Types:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('WindowSizeLayoutBreakpointInfo')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('SizeInVP, Size')
          .fontSize(12)
          .fontColor(Color.Gray)
        
        Text('UIEnvWindowAvoidAreaInfoPX, UIEnvWindowAvoidAreaInfoVP')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E3F2FD')
      .margin(10)
      
      // Important note
      Column() {
        Text('Important:')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
        
        Text('@Env properties cannot have default values')
          .fontSize(12)
          .fontColor(Color.Red)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
