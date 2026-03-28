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
 * Test case: Event decorator error in ComponentV2
 * Purpose: Verify @Event decorator usage and restrictions
 * Error code: 10905120
 */

// ============================================
// Test Case 1: @Event used in @Component V1
// Expected Error: 10905120
// ============================================

@Component
struct EventInV1Component {
  @Event onClickHandler: () => void = () => {}

  build() {
    Column() {
      Button('Click')
        .onClick(this.onClickHandler)
    }
  }
}

// ============================================
// Test Case 2: @Event with non-function type
// Expected Error: 10905120
// ============================================

@ComponentV2
struct EventWithNonFunction {
  @Event callback: string = 'test'

  build() {
    Column() {
      Text('Event: ' + this.callback)
    }
  }
}

// ============================================
// Test Case 3: @Event with wrong initialization
// Expected Error: 10905120
// ============================================

@ComponentV2
struct EventWithInvalidInit {
  @Event onSubmit: (data: string) => void = 'invalid' as unknown as (data: string) => void

  build() {
    Column() {
      Button('Submit')
        .onClick(() => {
          this.onSubmit('data')
        })
    }
  }
}

// ============================================
// Test Case 4: Correct @Event usage in V2
// ============================================

@ComponentV2
struct CorrectEventUsage {
  @Event onButtonClick: () => void = () => {}
  @Event onValueChanged: (value: number) => void = (value: number) => {}
  @Event onDataSubmit: (data: string) => boolean = (data: string): boolean => true

  @Local clickCount: number = 0

  build() {
    Column() {
      Text('Event Handler Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text('Click count: ' + this.clickCount)
        .fontSize(18)
        .margin(10)

      Button('Trigger Click Event')
        .onClick(() => {
          this.clickCount++
          this.onButtonClick()
        })
        .width(200)
        .height(50)
        .margin(10)

      Button('Trigger Value Change')
        .onClick(() => {
          this.onValueChanged(this.clickCount)
        })
        .width(200)
        .height(50)
        .margin(10)

      Button('Submit Data')
        .onClick(() => {
          const result = this.onDataSubmit('test data')
          console.log('Submit result: ' + result)
        })
        .width(200)
        .height(50)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: @Event with complex callback types
// ============================================

interface FormData {
  username: string
  password: string
  rememberMe: boolean
}

@ComponentV2
struct EventWithComplexTypes {
  @Event onFormSubmit: (data: FormData) => Promise<boolean> = async (data: FormData): Promise<boolean> => true
  @Event onValidationError: (errors: string[]) => void = (errors: string[]) => {}
  @Event onProgressUpdate: (progress: number) => void = (progress: number) => {}

  @Local formData: FormData = { username: '', password: '', rememberMe: false }
  @Local progress: number = 0

  build() {
    Column() {
      Text('Complex Event Handlers')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Form Data')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Username: ' + this.formData.username)
          .fontSize(14)
          .margin(5)

        Text('Remember: ' + (this.formData.rememberMe ? 'Yes' : 'No'))
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F5F5F5')
      .margin(10)

      Progress({ value: this.progress, total: 100 })
        .width('80%')
        .margin(10)

      Text('Progress: ' + this.progress + '%')
        .fontSize(16)
        .margin(5)

      Button('Submit Form')
        .onClick(async () => {
          const result = await this.onFormSubmit(this.formData)
          console.log('Form submit result: ' + result)
        })
        .width(180)
        .height(45)
        .margin(10)

      Button('Update Progress')
        .onClick(() => {
          this.progress = Math.min(this.progress + 10, 100)
          this.onProgressUpdate(this.progress)
        })
        .width(180)
        .height(45)
        .margin(10)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestEventDecorator {
  @State testTitle: string = '@Event Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905120')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Event in @Component V1')
          .fontSize(14)
          .margin(5)

        Text('@Event with non-function type')
          .fontSize(14)
          .margin(5)

        Text('@Event with invalid initialization')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Event Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Can only be used in @ComponentV2')
          .fontSize(14)
          .margin(2)

        Text('2. Must be of function type')
          .fontSize(14)
          .margin(2)

        Text('3. Used for parent-child communication')
          .fontSize(14)
          .margin(2)

        Text('4. Default value should be empty function')
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

        Text('struct Child {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Event onClick: () => void = () => {}')
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
