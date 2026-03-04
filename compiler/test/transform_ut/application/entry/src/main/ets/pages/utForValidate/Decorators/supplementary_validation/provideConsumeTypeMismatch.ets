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
 * Test case: @Provide/@Consume type mismatch
 * Purpose: Verify @Provide and @Consume must have matching types
 * Error codes: 10905312
 */

// ============================================
// Test Case 1: Type mismatch between @Provide and @Consume
// Expected Error: 10905312
// ============================================

@Component
struct ProvideConsumeMismatch {
  @Provide('data') dataValue: string = 'test';
  
  build() {
    Column() {
      ChildWithMismatch()
    }
  }
}

@Component
struct ChildWithMismatch {
  // Error: Type mismatch - @Provide is string but @Consume is number - 10905312
  @Consume('data') dataValue: number;
  
  build() {
    Column() {
      Text('Type Mismatch')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: Another type mismatch
// ============================================

@Component
struct AnotherMismatchParent {
  @Provide('config') config: boolean = true;
  
  build() {
    Column() {
      AnotherMismatchChild()
    }
  }
}

@Component
struct AnotherMismatchChild {
  // Error: Type mismatch - boolean vs string - 10905312
  @Consume('config') config: string;
  
  build() {
    Column() {
      Text('Another Mismatch')
    }
  }
}

// ============================================
// Test Case 3: Correct type matching
// ============================================

@Component
struct CorrectTypeParent {
  @Provide('theme') theme: string = 'light';
  
  build() {
    Column() {
      CorrectTypeChild()
    }
  }
}

@Component
struct CorrectTypeChild {
  // Correct: Same type as @Provide
  @Consume('theme') theme: string;
  
  build() {
    Column() {
      Text('Correct Type')
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct ProvideConsumeTypeTestEntry {
  build() {
    Column() {
      Text('Type Mismatch Test')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      Column() {
        Text('Testing: 10905312')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Provide/@Consume type mismatch')
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
