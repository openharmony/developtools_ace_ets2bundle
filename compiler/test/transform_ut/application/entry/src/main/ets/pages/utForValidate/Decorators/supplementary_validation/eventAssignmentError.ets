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
 * Test case: Event variable assignment error
 * Purpose: Verify @Event variable should not be assigned when using two-way binding
 * Error code: 10905358
 */

// ============================================
// Test Case 1: @Event with direct assignment
// Expected Error: 10905358
// ============================================

@ComponentV2
struct EventAssignmentError {
  @Param value: number = 0
  @Event valueChange: (val: number) => void = (val) => {
    this.value = val
  }

  handleClick() {
    // Error: Do not assign value to @Event variable
    this.valueChange = (val) => console.log(val)
  }

  build() {
    Column() {
      Text('Value: ' + this.value)
        .onClick(() => this.handleClick())
    }
  }
}

// ============================================
// Test Case 2: @Event in binding expression
// Expected Error: 10905358
// ============================================

@ComponentV2
struct EventBindingError {
  @Param count: number = 0
  @Event onCountChange: (c: number) => void

  updateEvent() {
    // Error: Assigning to @Event variable
    this.onCountChange = () => {}
  }

  build() {
    Column() {
      Button('Update')
        .onClick(() => this.updateEvent())
    }
  }
}

// ============================================
// Test Case 3: Correct @Event usage
// ============================================

@ComponentV2
struct CorrectEventUsage {
  @Param message: string = ''
  @Event messageChange: (msg: string) => void

  build() {
    Column() {
      Text(this.message)
      Button('Change')
        .onClick(() => {
          // Correct: Call the event, don't reassign
          this.messageChange('new message')
        })
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestEventAssignmentError {
  @State testTitle: string = '@Event Assignment Error Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing: 10905358')
          .fontSize(18)
          .fontColor(Color.Red)

        Text('Do not assign to @Event variable')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)

        Text('@Event callback: (val) => void')
          .fontSize(12)
          .fontColor(Color.Green)

        Text('// Call: this.callback(value)')
          .fontSize(12)
          .fontColor(Color.Gray)
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
