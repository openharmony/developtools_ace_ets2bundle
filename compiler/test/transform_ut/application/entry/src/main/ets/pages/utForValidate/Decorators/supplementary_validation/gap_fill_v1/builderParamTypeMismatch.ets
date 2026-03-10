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
 * Test case: BuilderParam type mismatch error
 * Purpose: Verify @BuilderParam initialization restrictions
 * Error code: 10905101
 * 
 * Background:
 * - @BuilderParam property must be initialized correctly
 * - Type mismatch between property and builder causes compilation error
 * - This ensures type safety in component composition
 */

// ============================================
// Error Test Case 1: BuilderParam with wrong type
// ============================================

@Component
struct BuilderParamTypeMismatchChild1 {
  // Error: @BuilderParam with wrong type initialization - 10905101
  @BuilderParam componentBuilder: string = 'Hello'

  build() {
    Column() {
      Text('Child 1')
        .fontSize(16)
        .margin(5)
    }
    .padding(10)
    .backgroundColor('#FFEBEE')
  }
}

// ============================================
// Error Test Case 2: Another BuilderParam type error
// ============================================

@Component
struct BuilderParamTypeMismatchChild2 {
  // Error: @BuilderParam with number type - 10905101
  @BuilderParam builderValue: number = 100

  build() {
    Column() {
      Text('Child 2')
        .fontSize(16)
        .margin(5)
    }
    .padding(10)
    .backgroundColor('#FFF3E0')
  }
}

// ============================================
// Error Test Case 3: BuilderParam with boolean
// ============================================

@Component
struct BuilderParamTypeMismatchChild3 {
  // Error: @BuilderParam with boolean type - 10905101
  @BuilderParam builderFlag: boolean = true

  build() {
    Column() {
      Text('Child 3')
        .fontSize(16)
        .margin(5)
    }
    .padding(10)
    .backgroundColor('#FFFDE7')
  }
}

// ============================================
// Correct Usage Example
// ============================================

@Builder
function correctBuilderFunction() {
  Column() {
    Text('Correct Builder Content')
      .fontSize(18)
      .fontColor(Color.Green)
      .margin(10)
    
    Text('This is a valid builder')
      .fontSize(14)
      .fontColor(Color.Gray)
      .margin(5)
  }
  .padding(15)
  .backgroundColor('#E8F5E9')
  .borderRadius(8)
}

@Component
struct CorrectBuilderParamUsage {
  @BuilderParam validBuilder: () => void = correctBuilderFunction

  build() {
    Column() {
      Text('Correct Usage Example')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
        .fontColor(Color.Green)
      
      this.validBuilder()
    }
    .padding(15)
    .backgroundColor('#F5F5F5')
  }
}

// ============================================
// Test Entry Component
// ============================================

@Entry
@Component
struct TestBuilderParamTypeMismatch {
  @State testTitle: string = '@BuilderParam Type Mismatch Test'
  @State showCorrectExample: boolean = true

  build() {
    Column() {
      // Test Title
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
        .fontColor(Color.Red)
      
      // Error Information Card
      Column() {
        Text('Error: 10905101')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(10)
          .fontColor(Color.Red)
        
        Text('@BuilderParam property type mismatch')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('BuilderParam must be initialized with compatible builder type')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
          .fontColor(Color.Gray)
        
        Divider()
          .width('80%')
          .height(1)
          .color('#E0E0E0')
          .margin(10)
        
        Text('Invalid Types:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('string, number, boolean, object')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      // Toggle Button for Correct Example
      Button(this.showCorrectExample ? 'Hide Correct Example' : 'Show Correct Example')
        .fontSize(14)
        .width('80%')
        .margin(15)
        .backgroundColor('#4CAF50')
        .onClick(() => {
          this.showCorrectExample = !this.showCorrectExample
        })
      
      // Correct Usage Section
      if (this.showCorrectExample) {
        Column() {
          Text('Correct Implementation:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)
            .fontColor(Color.Green)
          
          Text('@BuilderParam')
            .fontSize(14)
            .fontColor(Color.Blue)
            .margin(3)
          
          Text('validBuilder: () => void = correctBuilderFunction')
            .fontSize(12)
            .fontColor(Color.Gray)
            .margin(3)
          
          Divider()
            .width('70%')
            .height(1)
            .color('#E0E0E0')
            .margin(10)
          
          CorrectBuilderParamUsage()
        }
        .width('90%')
        .padding(15)
        .backgroundColor('#E8F5E9')
        .borderRadius(8)
        .margin(10)
      }
      
      // Error Components
      Column() {
        Text('Error Cases:')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin(10)
          .fontColor(Color.Red)
        
        BuilderParamTypeMismatchChild1()
          .margin(5)
        
        BuilderParamTypeMismatchChild2()
          .margin(5)
        
        BuilderParamTypeMismatchChild3()
          .margin(5)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#FAFAFA')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}