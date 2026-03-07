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
 * Test case: Entry decorator parameter error
 * Purpose: Verify @Entry decorator parameter validation
 * Error code: 10905210
 */

// ============================================
// Test Case 1: @Entry with invalid parameter
// Expected Error: 10905210
// ============================================

@Entry('invalid')
@Component
struct EntryWithInvalidParam {
  build() {
    Column() {
      Text('Invalid Entry')
    }
  }
}

// ============================================
// Test Case 2: @Entry with wrong type parameter
// Expected Error: 10905210
// ============================================

@Entry(123)
@Component
struct EntryWithNumberParam {
  build() {
    Column() {
      Text('Entry with number')
    }
  }
}

// ============================================
// Test Case 3: @Entry with object parameter
// Expected Error: 10905210
// ============================================

@Entry({ storage: 'local' })
@Component
struct EntryWithObjectParam {
  build() {
    Column() {
      Text('Entry with object')
    }
  }
}

// ============================================
// Test Case 4: Correct @Entry without parameters
// ============================================

@Entry
@Component
struct CorrectEntryNoParam {
  @State title: string = 'Main Page'
  @State count: number = 0

  build() {
    Column() {
      Text(this.title)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .margin(30)

      Text('Count: ' + this.count)
        .fontSize(24)
        .margin(20)

      Button('Increment')
        .onClick(() => {
          this.count++
        })
        .width(150)
        .height(50)
        .margin(10)

      Button('Reset')
        .onClick(() => {
          this.count = 0
        })
        .width(150)
        .height(50)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: Correct @Entry with LocalStorage
// ============================================

let storage: LocalStorage = new LocalStorage()

@Entry(storage)
@Component
struct CorrectEntryWithStorage {
  @LocalStorageProp('username') username: string = 'Guest'
  @LocalStorageProp('isLoggedIn') isLoggedIn: boolean = false

  build() {
    Column() {
      Text('User Profile')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Username: ' + this.username)
          .fontSize(18)
          .margin(10)

        Text('Status: ' + (this.isLoggedIn ? 'Logged In' : 'Guest'))
          .fontSize(18)
          .fontColor(this.isLoggedIn ? Color.Green : Color.Gray)
          .margin(10)
      }
      .padding(20)
      .backgroundColor('#F5F5F5')
      .borderRadius(10)
      .margin(15)

      Button(this.isLoggedIn ? 'Logout' : 'Login')
        .onClick(() => {
          this.isLoggedIn = !this.isLoggedIn
          this.username = this.isLoggedIn ? 'User123' : 'Guest'
        })
        .width(150)
        .height(50)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 6: Multiple @Entry pages demonstration
// ============================================

@Entry
@Component
struct HomePage {
  @State pageTitle: string = 'Home'
  @State menuItems: string[] = ['Profile', 'Settings', 'About', 'Help']

  build() {
    Column() {
      Text(this.pageTitle)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      List() {
        ForEach(this.menuItems, (item: string, index: number) => {
          ListItem() {
            Row() {
              Text(item)
                .fontSize(18)
                .layoutWeight(1)

              Text('>')
                .fontSize(18)
                .fontColor(Color.Gray)
            }
            .width('100%')
            .padding(15)
            .backgroundColor(index % 2 === 0 ? '#FFFFFF' : '#F5F5F5')
          }
          .margin(5)
        })
      }
      .width('90%')
      .layoutWeight(1)

      Text('© 2026 Application')
        .fontSize(12)
        .fontColor(Color.Gray)
        .margin(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestEntryDecorator {
  @State testTitle: string = '@Entry Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905210')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Entry with invalid parameter')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Entry Rules:',)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Can be used without parameters')
          .fontSize(14)
          .margin(2)

        Text('2. Can have LocalStorage parameter')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot have string/number/object params')
          .fontSize(14)
          .margin(2)

        Text('4. Must decorate @Component struct')
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

        Text('@Entry')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyPage { ... }')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('')
          .fontSize(10)
          .margin(2)

        Text('// With LocalStorage')
          .fontSize(12)
          .fontColor(Color.Blue)
          .margin(2)

        Text('@Entry(storage)')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyPage { ... }')
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
