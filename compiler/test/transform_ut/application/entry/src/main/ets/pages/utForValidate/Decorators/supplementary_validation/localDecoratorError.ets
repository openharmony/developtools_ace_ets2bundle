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
 * Test case: Local decorator error in ComponentV2
 * Purpose: Verify @Local decorator usage and restrictions in ComponentV2
 * Error code: 10905110
 */

// ============================================
// Test Case 1: @Local used in @Component V1
// Expected Error: 10905110
// ============================================

@Component
struct LocalInV1Component {
  @Local count: number = 0

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

// ============================================
// Test Case 2: @Local with function initialization
// Expected Error: 10905110
// ============================================

@ComponentV2
struct LocalWithFunctionInit {
  @Local value: number = Math.random() * 100

  build() {
    Column() {
      Text('Value: ' + this.value)
    }
  }
}

// ============================================
// Test Case 3: @Local with complex expression
// Expected Error: 10905110
// ============================================

@ComponentV2
struct LocalWithComplexInit {
  @Local data: string = 'hello' + ' world' + new Date().toString()

  build() {
    Column() {
      Text('Data: ' + this.data)
    }
  }
}

// ============================================
// Test Case 4: Correct @Local usage in V2
// ============================================

@ComponentV2
struct CorrectLocalUsage {
  @Local counter: number = 0
  @Local message: string = 'Hello'
  @Local isActive: boolean = false
  @Local items: number[] = []

  build() {
    Column() {
      Text(this.message)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Counter: ' + this.counter)
        .fontSize(16)
        .margin(5)

      Text('Status: ' + (this.isActive ? 'Active' : 'Inactive'))
        .fontSize(16)
        .margin(5)

      Text('Items count: ' + this.items.length)
        .fontSize(16)
        .margin(5)

      Button('Increment')
        .onClick(() => {
          this.counter++
        })
        .margin(10)

      Button('Toggle Status')
        .onClick(() => {
          this.isActive = !this.isActive
        })
        .margin(10)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 5: @Local with type annotation
// ============================================

interface UserInfo {
  name: string
  age: number
  email: string
}

@ComponentV2
struct LocalWithTypes {
  @Local user: UserInfo = { name: 'John', age: 25, email: 'john@example.com' }
  @Local scores: number[] = [85, 90, 78, 92]
  @Local settings: Record<string, boolean> = { darkMode: false, notifications: true }

  build() {
    Column() {
      Text('User Profile')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Name: ' + this.user.name)
          .fontSize(16)
          .margin(5)

        Text('Age: ' + this.user.age)
          .fontSize(16)
          .margin(5)

        Text('Email: ' + this.user.email)
          .fontSize(16)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F5F5F5')
      .margin(10)

      Text('Scores: ' + this.scores.join(', '))
        .fontSize(16)
        .margin(10)

      Row() {
        Text('Dark Mode: ' + (this.settings.darkMode ? 'On' : 'Off'))
          .fontSize(14)
          .margin(5)

        Text('Notifications: ' + (this.settings.notifications ? 'On' : 'Off'))
          .fontSize(14)
          .margin(5)
      }
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
struct TestLocalDecorator {
  @State testTitle: string = '@Local Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905110')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Local in @Component V1')
          .fontSize(14)
          .margin(5)

        Text('@Local with invalid initialization')
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
          .margin(2)

        Text('2. Must use simple initialization')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot use function calls')
          .fontSize(14)
          .margin(2)

        Text('4. Cannot use complex expressions')
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

        Text('struct MyComponent {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Local count: number = 0')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Local name: string = "test"')
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
