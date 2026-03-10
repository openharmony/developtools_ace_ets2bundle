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
 * Test case: @Computed property with setter error
 * Purpose: Verify @Computed properties cannot define a set method
 * Error code: 10905130
 * 
 * Background:
 * - @Computed properties are read-only computed values
 * - They cannot have a setter method
 * - This ensures immutable computed properties
 */

@ComponentV2
struct ComputedWithSetterError {
  @Local count: number = 0

  // Error: @Computed with setter - 10905130
  @Computed
  get doubledCount(): number {
    return this.count * 2
  }
  set doubledCount(value: number) {
    this.count = value / 2
  }

  // Error: Another @Computed with setter - 10905130
  @Computed
  get tripledCount(): number {
    return this.count * 3
  }
  set tripledCount(val: number) {
    this.count = val / 3
  }

  build() {
    Column() {
      Text(`Count: ${this.count}`)
        .fontSize(18)
        .margin(10)
      
      Text(`Doubled: ${this.doubledCount}`)
        .fontSize(16)
        .margin(5)
    }
    .padding(15)
    .backgroundColor('#FFEBEE')
    .borderRadius(8)
  }
}

// Correct usage example
@ComponentV2
struct CorrectComputedUsage {
  @Local value: number = 10

  // Correct: @Computed without setter
  @Computed
  get squaredValue(): number {
    return this.value * this.value
  }

  build() {
    Column() {
      Text(`Value: ${this.value}`)
        .fontSize(18)
        .margin(10)
      
      Text(`Squared: ${this.squaredValue}`)
        .fontSize(16)
        .fontColor(Color.Green)
        .margin(5)
    }
    .padding(15)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .margin(10)
  }
}

@Entry
@Component
struct TestComputedSetterError {
  @State testTitle: string = '@Computed Setter Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('Error: 10905130')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
          .margin(10)
        
        Text('@Computed properties cannot have a setter')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Computed properties are read-only by design')
          .fontSize(12)
          .fontColor(Color.Gray)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#F5F5F5')
  }
}

// Documentation component
@Component
struct ComputedDocumentation {
  @State docTitle: string = '@Computed Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('@Computed properties:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(10)
      
      Text('Only getter method allowed')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Green)
      
      Text('No setter method - read only')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Red)
      
      Text('Value computed from @Local variables')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Blue)
      
      Text('Error code: 10905130')
        .fontSize(12)
        .fontColor(Color.Orange)
        .margin(5)
    }
    .padding(20)
    .backgroundColor('#FCE4EC')
    .borderRadius(8)
    .margin(10)
  }
}
