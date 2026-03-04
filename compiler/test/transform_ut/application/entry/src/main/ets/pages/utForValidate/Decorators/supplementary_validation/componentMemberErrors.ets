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
 * Test case: Component member errors
 * Purpose: Verify that @Watch decorator can only be used on state variables
 * Error codes: 10905310
 * 
 * Background:
 * - @Watch is used to monitor changes to state variables
 * - It can only be applied to variables decorated with state management decorators
 * - Regular variables cannot use @Watch
 */

// ============================================
// Test Case 1: @Watch on non-state variable
// Expected Error: 10905310
// ============================================

@Component
struct WatchOnNonState1 {
  // Error: @Watch on regular variable - 10905310
  @Watch('onChange')
  regularVar: string = 'test';

  onChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.regularVar)
        .fontSize(18)
    }
  }
}

// ============================================
// Test Case 2: Another @Watch on non-state variable
// ============================================

@Component
struct WatchOnNonState2 {
  // Error: @Watch on another regular variable - 10905310
  @Watch('onChange2')
  anotherVar: number = 0;

  onChange2() {
    console.log('changed2');
  }

  build() {
    Column() {
      Text(this.anotherVar.toString())
        .fontSize(18)
    }
  }
}

// ============================================
// Test Case 3: Correct usage with @State
// This demonstrates valid usage for comparison
// ============================================

@Component
struct CorrectWatchUsage {
  @State @Watch('onStateChange') stateVar: string = 'state';
  
  onStateChange() {
    console.log('state changed');
  }
  
  build() {
    Column() {
      Text(this.stateVar)
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
struct TestComponentMember {
  @State testTitle: string = 'Component Member Test';
  
  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905310')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('@Watch on non-state variable')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
      
      // Description
      Column() {
        Text('Rule: @Watch can only be used on state variables')
          .fontSize(14)
          .fontColor(Color.Gray)
        
        Text('Valid: @State @Watch(...)')
          .fontSize(12)
          .fontColor(Color.Green)
        
        Text('Invalid: @Watch(...) without state decorator')
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
