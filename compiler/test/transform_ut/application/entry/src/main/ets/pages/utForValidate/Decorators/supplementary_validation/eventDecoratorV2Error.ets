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
 * Test case: @Event in V1 component
 * Purpose: Verify @Event can only be used in @ComponentV2
 * Error code: 10905338
 */

// ============================================
// Test Case 1: @Event in V1 component
// Expected Error: 10905338
// ============================================

@Component
struct EventInV1Case1 {
  // Error: @Event can only be used in @ComponentV2
  @Event onChange: () => void = () => {}

  build() {
    Column() {
      Text('Event in V1')
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: @Event with params in V1
// Expected Error: 10905338
// ============================================

@Component
struct EventInV1Case2 {
  // Error: @Event cannot be used in V1
  @Event onClick: (x: number) => void = (x) => console.log(x)
  @Event onSubmit: (data: string) => void = (data) => {}

  build() {
    Column() {
      Text('Multiple events in V1')
    }
  }
}

// ============================================
// Test Case 3: Third case with @Event
// Expected Error: 10905338
// ============================================

@Component
struct EventInV1Case3 {
  // Error: @Event in V1 component
  @Event callback: () => void = () => {}
  @Event anotherEvent: (val: boolean) => void = (val) => {}

  build() {
    Column() {
      Text('Callback in V1')
    }
  }
}

// ============================================
// Test Case 4: Correct usage in V2
// ============================================

@ComponentV2
struct CorrectEventUsage {
  @Param value: number = 0
  @Event valueChange: (val: number) => void = (val) => {}

  build() {
    Column() {
      Text('V2 with @Event')
        .fontSize(20)
        .margin(15)

      Text('Value: ' + this.value)
        .fontSize(16)
        .margin(5)

      Button('Change')
        .onClick(() => {
          this.valueChange(this.value + 1)
        })
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
struct TestEventDecoratorV2 {
  @State testTitle: string = '@Event V2 Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905338')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Event can only be used in @ComponentV2')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Rules:')
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

        Text('3. Used for child-to-parent communication')
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

        Text('  @Event onAction: () => void')
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
