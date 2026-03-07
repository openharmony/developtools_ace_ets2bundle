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
 * Test case: @Local decorator in V1 component
 * Purpose: Verify @Local can only be used in @ComponentV2
 * Error code: 10905361
 */

// ============================================
// Test Case 1: @Local in V1 component
// Expected Error: 10905361
// ============================================

@Component
struct LocalInV1Component {
  // Error: @Local can only be used in @ComponentV2
  @Local count: number = 0

  build() {
    Column() {
      Text('Count: ' + this.count)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: @Local with wrong initialization in V1
// Expected Error: 10905361
// ============================================

@Component
struct LocalWithWrongInit {
  // Error: @Local cannot be used in V1
  @Local message: string = 'Hello'
  @Local items: string[] = []

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// ============================================
// Test Case 3: Correct @Local in V2
// ============================================

@ComponentV2
struct CorrectLocalInV2 {
  @Local counter: number = 0
  @Local userName: string = 'User'
  @Local isActive: boolean = true
  @Local dataList: string[] = ['item1', 'item2']

  build() {
    Column() {
      Text('V2 Component with @Local')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Text('Counter: ' + this.counter)
        .fontSize(16)
        .margin(5)

      Text('User: ' + this.userName)
        .fontSize(16)
        .margin(5)

      Text('Active: ' + this.isActive)
        .fontSize(16)
        .margin(5)

      Text('Items: ' + this.dataList.length)
        .fontSize(16)
        .margin(5)

      Button('Increment')
        .onClick(() => {
          this.counter++
        })
        .margin(10)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 4: Multiple @Local properties
// ============================================

@ComponentV2
struct MultipleLocalProps {
  @Local width: number = 100
  @Local height: number = 200
  @Local color: string = '#FF0000'
  @Local visible: boolean = true

  @Computed
  get area(): number {
    return this.width * this.height
  }

  build() {
    Column() {
      Text('Multiple @Local Properties')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Text('Width: ' + this.width)
        .fontSize(14)
        .margin(3)

      Text('Height: ' + this.height)
        .fontSize(14)
        .margin(3)

      Text('Area: ' + this.area)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Blue)
        .margin(3)

      Text('Color: ' + this.color)
        .fontSize(14)
        .margin(3)

      Text('Visible: ' + this.visible)
        .fontSize(14)
        .margin(3)

      Row() {
        Button('Width++')
          .onClick(() => this.width += 10)
          .margin(5)

        Button('Height++')
          .onClick(() => this.height += 10)
          .margin(5)
      }
      .margin(10)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestLocalDecoratorV2 {
  @State testTitle: string = '@Local V2 Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905361')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Local can only be used in @ComponentV2')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Local Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Can only be used in @ComponentV2')
          .fontSize(14)
          .fontColor(Color.Red)
          .margin(2)

        Text('2. Cannot be used in @Component (V1)')
          .fontSize(14)
          .fontColor(Color.Red)
          .margin(2)

        Text('3. Represents local component state')
          .fontSize(14)
          .margin(2)

        Text('4. Can be observed with @Monitor')
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

        Text('@ComponentV2')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyComp {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Local value: number = 0')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('}')
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
