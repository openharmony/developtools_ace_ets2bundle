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
 * Test case: Param decorator error in V2
 * Purpose: Verify @Param decorator usage in ComponentV2
 * Error code: 10905350
 */

// ============================================
// Test Case 1: @Param with complex initialization
// Expected Error: 10905350
// ============================================

@ComponentV2
struct ParamComplexInit {
  @Param value: number = Math.random() * 100

  build() {
    Column() {
      Text('Value: ' + this.value)
    }
  }
}

// ============================================
// Test Case 2: @Param with function call
// Expected Error: 10905350
// ============================================

function getDefaultValue(): string {
  return 'default'
}

@ComponentV2
struct ParamWithFunction {
  @Param message: string = getDefaultValue()

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// ============================================
// Test Case 3: Correct @Param usage
// ============================================

@ComponentV2
struct CorrectParamUsage {
  @Param title: string = 'Default Title'
  @Param count: number = 0
  @Param isActive: boolean = false
  @Param items: string[] = []

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Count: ' + this.count)
        .fontSize(16)
        .margin(5)

      Text('Active: ' + (this.isActive ? 'Yes' : 'No'))
        .fontSize(16)
        .margin(5)

      Text('Items: ' + this.items.length)
        .fontSize(16)
        .margin(5)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 4: @Param with various types
// ============================================

@ComponentV2
struct ParamWithTypes {
  @Param stringValue: string = ''
  @Param numberValue: number = 0
  @Param booleanValue: boolean = true
  @Param arrayValue: number[] = [1, 2, 3]
  @Param objectValue: Record<string, string> = {}

  build() {
    Column() {
      Text('String: ' + this.stringValue)
        .fontSize(14)
        .margin(3)

      Text('Number: ' + this.numberValue)
        .fontSize(14)
        .margin(3)

      Text('Boolean: ' + this.booleanValue)
        .fontSize(14)
        .margin(3)

      Text('Array length: ' + this.arrayValue.length)
        .fontSize(14)
        .margin(3)
    }
    .width('100%')
    .padding(15)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestParamDecorator {
  @State testTitle: string = '@Param Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905350')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Param with invalid initialization')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Param Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must use simple default values')
          .fontSize(14)
          .margin(2)

        Text('2. Cannot use function calls')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot use complex expressions')
          .fontSize(14)
          .margin(2)

        Text('4. Can only be used in @ComponentV2')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@Param value: number = 0')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Param name: string = "test"')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)
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
