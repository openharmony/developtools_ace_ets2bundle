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
 * Test case: @ComponentReuse method with parameters error
 * Purpose: Verify @ComponentReuse methods in @ComponentV2 cannot have parameters
 * Error code: 10905370
 * 
 * Background:
 * - In @ComponentV2, methods decorated with @ComponentReuse cannot have input parameters
 * - This ensures proper component reuse lifecycle management
 * - Parameters would interfere with the reuse mechanism
 */

@ComponentV2
@ReusableV2
struct ComponentReuseWithParams {
  @Param value: string = 'test'
  @Local count: number = 0

  // Error: @ComponentReuse method with parameter - 10905370
  @ComponentReuse
  aboutToReuse(params: Record<string, Object | null | undefined>) {
    this.count++
  }

  // Error: Another @ComponentReuse method with parameters - 10905370
  @ComponentReuse
  reuseWithMultipleParams(a: number, b: string) {
    this.count = a
  }

  build() {
    Column() {
      Text(this.value)
        .fontSize(18)
        .margin(10)
      
      Text(`Count: ${this.count}`)
        .fontSize(16)
        .margin(10)
    }
    .padding(15)
    .backgroundColor('#E3F2FD')
    .borderRadius(8)
  }
}

// Correct usage example
@ComponentV2
@ReusableV2
struct CorrectComponentReuse {
  @Param message: string = 'default'
  @Local counter: number = 0

  // Correct: @ComponentReuse without parameters
  @ComponentReuse
  aboutToReuse() {
    this.counter++
  }

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
        .margin(10)
      
      Text(`Counter: ${this.counter}`)
        .fontSize(16)
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
struct TestComponentReuseParams {
  @State testTitle: string = '@ComponentReuse Params Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation
      Column() {
        Text('Error: 10905370')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
          .margin(10)
        
        Text('@ComponentReuse methods cannot have parameters in @ComponentV2')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('Parameters interfere with component reuse mechanism')
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
struct ComponentReuseDocumentation {
  @State docTitle: string = '@ComponentReuse Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('In @ComponentV2:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(10)
      
      Text('@ComponentReuse methods must have no parameters')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Red)
      
      Text('This ensures proper lifecycle management')
        .fontSize(14)
        .margin(10)
        .fontColor(Color.Green)
    }
    .padding(20)
    .backgroundColor('#FCE4EC')
    .borderRadius(8)
    .margin(10)
  }
}
