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
 * Test case: Consumer decorator error
 * Purpose: Verify @Consumer decorator usage and restrictions
 * Error code: 10905201
 */

// ============================================
// Test Case 1: @Consumer without @Provider parent
// Expected Error: 10905201
// ============================================

@Component
struct ConsumerWithoutProvider {
  @Consume theme: string

  build() {
    Column() {
      Text('Theme: ' + this.theme)
    }
  }
}

// ============================================
// Test Case 2: @Consumer with wrong type
// Expected Error: 10905201
// ============================================

@Component
struct ParentWithProvider {
  @Provider() count: number = 10

  build() {
    Column() {
      ChildConsumerWithWrongType()
    }
  }
}

@Component
struct ChildConsumerWithWrongType {
  @Consume count: string

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

// ============================================
// Test Case 3: @Consumer used outside @Component
// Expected Error: 10905201
// ============================================

class ConsumerOutsideComponent {
  @Consume data: string = ''
}

// ============================================
// Test Case 4: Correct @Consumer usage
// ============================================

@Component
struct ParentComponentWithConsumer {
  @Provider() theme: string = 'light'
  @Provider() fontSize: number = 16
  @Provider() userName: string = 'Guest'

  build() {
    Column() {
      Text('Parent Component')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      ChildConsumerCorrect()

      Button('Change Theme')
        .onClick(() => {
          this.theme = this.theme === 'light' ? 'dark' : 'light'
        })
        .margin(10)
    }
    .width('100%')
    .padding(20)
  }
}

@Component
struct ChildConsumerCorrect {
  @Consume theme: string
  @Consume fontSize: number
  @Consume userName: string

  build() {
    Column() {
      Text('Child Component')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(10)

      Text('Theme: ' + this.theme)
        .fontSize(this.fontSize)
        .margin(5)

      Text('User: ' + this.userName)
        .fontSize(this.fontSize)
        .margin(5)
    }
    .padding(15)
    .backgroundColor(this.theme === 'dark' ? '#333333' : '#FFFFFF')
    .borderRadius(10)
    .margin(10)
  }
}

// ============================================
// Test Case 5: Nested @Consumer components
// ============================================

@Component
struct GrandParentComponent {
  @Provider() appLanguage: string = 'en'
  @Provider() appVersion: string = '1.0.0'
  @Provider() debugMode: boolean = false

  build() {
    Column() {
      Text('GrandParent Component')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      ParentWithConsumer()
    }
    .width('100%')
    .padding(20)
  }
}

@Component
struct ParentWithConsumer {
  build() {
    Column() {
      Text('Parent Component')
        .fontSize(20)
        .margin(10)

      NestedChildConsumer()
    }
    .padding(10)
    .backgroundColor('#F5F5F5')
    .margin(10)
  }
}

@Component
struct NestedChildConsumer {
  @Consume appLanguage: string
  @Consume appVersion: string
  @Consume debugMode: boolean

  build() {
    Column() {
      Text('Nested Child Component')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(10)

      Column() {
        Text('Language: ' + this.appLanguage.toUpperCase())
          .fontSize(16)
          .margin(3)

        Text('Version: ' + this.appVersion)
          .fontSize(16)
          .margin(3)

        Text('Debug: ' + (this.debugMode ? 'ON' : 'OFF'))
          .fontSize(16)
          .fontColor(this.debugMode ? Color.Red : Color.Green)
          .margin(3)
      }
      .padding(15)
      .backgroundColor('#E8F5E9')
      .borderRadius(8)
    }
    .padding(10)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestConsumerDecorator {
  @State testTitle: string = '@Consumer Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905201')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Consumer without @Provider')
          .fontSize(14)
          .margin(5)

        Text('@Consumer with wrong type')
          .fontSize(14)
          .margin(5)

        Text('@Consumer outside @Component')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Consumer Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must have @Provider in ancestor')
          .fontSize(14)
          .margin(2)

        Text('2. Type must match @Provider')
          .fontSize(14)
          .margin(2)

        Text('3. Must be used inside @Component')
          .fontSize(14)
          .margin(2)

        Text('4. Enables parent-child data sharing')
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

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct Child {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Consume theme: string')
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
