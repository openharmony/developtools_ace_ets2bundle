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
 * Test case: Computed property with two-way binding
 * Purpose: Verify @Computed property cannot use two-way binding syntax ($$)
 * Error code: 10905129
 */

// ============================================
// Test Case 1: @Computed with two-way binding
// Expected Error: 10905129
// ============================================

@ComponentV2
struct ComputedWithTwoWayBinding {
  @Local baseValue: number = 10

  // @Computed should not allow two-way binding
  @Computed
  get computedValue(): number {
    return this.baseValue * 2
  }

  build() {
    Column() {
      // Error: Using $$ syntax with @Computed property
      Text('Value: ' + $$computedValue)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: @Computed with setter (another error case)
// Expected Error: 10905130
// ============================================

@ComponentV2
struct ComputedWithSetter {
  @Local internalValue: number = 100

  // Error: @Computed cannot have a setter
  @Computed
  get calculatedValue(): number {
    return this.internalValue + 50
  }

  set calculatedValue(value: number) {
    this.internalValue = value - 50
  }

  build() {
    Column() {
      Text('Value: ' + this.calculatedValue)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct @Computed usage
// ============================================

@ComponentV2
struct CorrectComputedUsage {
  @Local price: number = 100
  @Local quantity: number = 2

  // Correct: @Computed with only getter
  @Computed
  get totalPrice(): number {
    return this.price * this.quantity
  }

  build() {
    Column() {
      Text('Price: ' + this.price)
        .fontSize(16)
      Text('Quantity: ' + this.quantity)
        .fontSize(16)
      Text('Total: ' + this.totalPrice)
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Green)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestComputedErrors {
  @State testTitle: string = '@Computed Errors Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      // Error information
      Column() {
        Text('Testing: 10905129, 10905130')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('@Computed property restrictions')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      // Rules
      Column() {
        Text('Rules for @Computed:',)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Cannot use $$ two-way binding syntax')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('2. Cannot define a setter method')
          .fontSize(12)
          .fontColor(Color.Red)
          .margin(2)

        Text('3. Can only decorate GetAccessor (getter)')
          .fontSize(12)
          .fontColor(Color.Blue)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      // Correct example
      Column() {
        Text('Correct @Computed:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@Computed\nget total(): number {\n  return this.a + this.b\n}')
          .fontSize(12)
          .fontColor(Color.Green)
          .margin(5)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(5)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
