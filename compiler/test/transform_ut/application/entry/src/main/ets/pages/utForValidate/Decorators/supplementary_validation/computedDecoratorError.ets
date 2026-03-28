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
 * Test case: Computed decorator error
 * Purpose: Verify @Computed decorator usage restrictions
 * Error code: 10905130
 */

// ============================================
// Test Case 1: @Computed with setter method
// Expected Error: 10905130
// ============================================

@ComponentV2
struct ComputedWithSetterError {
  @Local baseValue: number = 10

  @Computed
  get doubled(): number {
    return this.baseValue * 2
  }

  // Error: @Computed property cannot have setter
  set doubled(value: number) {
    this.baseValue = value / 2
  }

  build() {
    Column() {
      Text('Value: ' + this.doubled)
    }
  }
}

// ============================================
// Test Case 2: @Computed with two-way binding
// Expected Error: 10905129
// ============================================

@ComponentV2
struct ComputedWithTwoWayBinding {
  @Local count: number = 5

  @Computed
  get squared(): number {
    return this.count * this.count
  }

  build() {
    Column() {
      // Error: Cannot use $$ syntax with @Computed
      TextInput({ text: $$squared })
    }
  }
}

// ============================================
// Test Case 3: Correct @Computed usage
// ============================================

@ComponentV2
struct CorrectComputedUsage {
  @Local width: number = 100
  @Local height: number = 50
  @Local price: number = 10
  @Local quantity: number = 3

  // Correct: @Computed with only getter
  @Computed
  get area(): number {
    return this.width * this.height
  }

  @Computed
  get total(): number {
    return this.price * this.quantity
  }

  @Computed
  get displayInfo(): string {
    return `Area: ${this.area}, Total: ${this.total}`
  }

  build() {
    Column() {
      Text(this.displayInfo)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Width: ' + this.width)
        .fontSize(14)
        .margin(5)

      Text('Height: ' + this.height)
        .fontSize(14)
        .margin(5)

      Text('Area: ' + this.area)
        .fontSize(14)
        .fontColor(Color.Blue)
        .margin(5)

      Text('Total: ' + this.total)
        .fontSize(14)
        .fontColor(Color.Green)
        .margin(5)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 4: Multiple @Computed properties
// ============================================

@ComponentV2
struct MultipleComputedProps {
  @Local radius: number = 5
  @Local length: number = 10
  @Local width: number = 8

  @Computed
  get circleArea(): number {
    return Math.PI * this.radius * this.radius
  }

  @Computed
  get rectangleArea(): number {
    return this.length * this.width
  }

  @Computed
  get combinedArea(): number {
    return this.circleArea + this.rectangleArea
  }

  build() {
    Column() {
      Text('Multiple Computed Properties Demo')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Column() {
        Text('Circle:')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
        Text('Radius: ' + this.radius)
        Text('Area: ' + this.circleArea.toFixed(2))
      }
      .margin(10)

      Column() {
        Text('Rectangle:')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
        Text('Length: ' + this.length)
        Text('Width: ' + this.width)
        Text('Area: ' + this.rectangleArea)
      }
      .margin(10)

      Text('Combined: ' + this.combinedArea.toFixed(2))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Orange)
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
struct TestComputedDecorator {
  @State testTitle: string = '@Computed Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information display
      Column() {
        Text('Testing Error Codes:')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('10905129 - @Computed with two-way binding')
          .fontSize(14)
          .margin(2)

        Text('10905130 - @Computed with setter')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rules section
      Column() {
        Text('@Computed Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Can only have getter method')
          .fontSize(14)
          .margin(2)

        Text('2. Cannot have setter method')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot use $$ two-way binding')
          .fontSize(14)
          .margin(2)

        Text('4. Must depend on other state variables')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Correct usage examples
      Column() {
        Text('Correct Usage Examples:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('@Computed')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('get total(): number {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  return this.price * this.qty')
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
