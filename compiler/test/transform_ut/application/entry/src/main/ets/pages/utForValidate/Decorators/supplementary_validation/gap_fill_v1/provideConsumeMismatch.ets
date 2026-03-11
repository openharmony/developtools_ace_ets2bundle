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
 * Test case: Provide/Consume type mismatch
 * Purpose: Verify @Provide and @Consume must have matching types
 * Error code: 10905336
 */

// Parent component with @Provide
@Component
struct ProvideParent {
  @Provide('sharedData') sharedValue: string = 'Parent String'
  
  build() {
    Column() {
      Text('Parent: ' + this.sharedValue)
        .fontSize(18)
        .margin(10)
      
      ProvideChild()
    }
    .padding(15)
    .backgroundColor('#E3F2FD')
  }
}

// Error: Child with mismatched type - 10905336
@Component
struct ProvideChild {
  // Error: Type mismatch with parent @Provide
  @Consume('sharedData') sharedValue: number = 0
  
  build() {
    Column() {
      Text('Child: ' + this.sharedValue)
        .fontSize(18)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#FFEBEE')
  }
}

// Correct usage with matching types
@Component
struct CorrectProvideParent {
  @Provide('correctData') correctValue: string = 'Matching Type'
  
  build() {
    Column() {
      Text('Correct Parent: ' + this.correctValue)
        .fontSize(18)
        .margin(10)
        .fontColor(Color.Green)
      
      CorrectProvideChild()
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
  }
}

@Component
struct CorrectProvideChild {
  @Consume('correctData') correctValue: string
  
  build() {
    Column() {
      Text('Correct Child: ' + this.correctValue)
        .fontSize(18)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#C8E6C9')
  }
}

@Entry
@Component
struct TestProvideConsumeMismatch {
  @State testTitle: string = 'Provide/Consume Type Mismatch Test'
  @State showDetails: boolean = true

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
        .fontColor(Color.Red)
      
      Column() {
        Text('Error: 10905336')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(10)
          .fontColor(Color.Red)
        
        Text('Provide/Consume Type Mismatch')
          .fontSize(16)
          .margin(8)
          .fontColor(Color.Orange)
        
        Text('@Provide and @Consume must have matching types')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
          .fontColor(Color.Gray)
        
        Divider()
          .width('80%')
          .height(1)
          .color('#E0E0E0')
          .margin(10)
        
        Text('Error Example:')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin(5)
        
        Text('Parent: @Provide string')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
        
        Text('Child: @Consume number')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(3)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
      
      CorrectProvideParent()
        .margin(20)
      
      Text('Parent: @Provide string')
        .fontSize(12)
        .fontColor(Color.Green)
        .margin(3)
      
      Text('Child: @Consume string')
        .fontSize(12)
        .fontColor(Color.Green)
        .margin(3)
      
      Text('Ensure @Provide and @Consume types match exactly')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(15)
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}
