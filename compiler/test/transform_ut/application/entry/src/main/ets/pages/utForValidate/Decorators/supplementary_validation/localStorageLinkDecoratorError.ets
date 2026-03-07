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
 * Test case: LocalStorageLink decorator error
 * Purpose: Verify @LocalStorageLink decorator usage and validation
 * Error code: 10906600
 */

// ============================================
// Test Case 1: @LocalStorageLink without storage
// Expected Error: 10906600
// ============================================

@Component
struct LocalStorageLinkNoStorage {
  @LocalStorageLink('key') value: string = 'default'

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// ============================================
// Test Case 2: @LocalStorageLink with invalid key
// Expected Error: 10906600
// ============================================

@Component
struct LocalStorageLinkInvalidKey {
  @LocalStorageLink('') emptyKey: string = 'default'

  build() {
    Column() {
      Text(this.emptyKey)
    }
  }
}

// ============================================
// Test Case 3: @LocalStorageLink without @Component
// Expected Error: 10906600
// ============================================

class LocalStorageLinkOutside {
  @LocalStorageLink('data') data: number = 0
}

// ============================================
// Test Case 4: Correct @LocalStorageLink usage
// ============================================

let myLocalStorage: LocalStorage = new LocalStorage()
myLocalStorage.setOrCreate('username', 'Guest')
myLocalStorage.setOrCreate('counter', 0)
myLocalStorage.setOrCreate('settings', {
  theme: 'light',
  notifications: true
})

@Component
struct CorrectLocalStorageLinkUsage {
  @LocalStorageLink('username') username: string = 'Guest'
  @LocalStorageLink('counter') counter: number = 0

  build() {
    Column() {
      Text('Local Storage Link Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('User: ' + this.username)
          .fontSize(18)
          .margin(15)

        Text('Counter: ' + this.counter)
          .fontSize(18)
          .margin(15)
      }
      .padding(20)
      .backgroundColor('#E3F2FD')
      .borderRadius(10)
      .margin(15)

      Row() {
        Button('Change User')
          .onClick(() => {
            this.username = this.username === 'Guest' ? 'User123' : 'Guest'
          })
          .margin(5)

        Button('Increment')
          .onClick(() => {
            this.counter++
          })
          .margin(5)

        Button('Reset')
          .onClick(() => {
            this.counter = 0
          })
          .margin(5)
      }
      .margin(15)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

@Entry(myLocalStorage)
@Component
struct LocalStorageEntryPoint {
  build() {
    CorrectLocalStorageLinkUsage()
  }
}

// ============================================
// Test Case 5: @LocalStorageLink with object
// ============================================

let objectStorage: LocalStorage = new LocalStorage()
objectStorage.setOrCreate('userProfile', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
})

objectStorage.setOrCreate('appConfig', {
  language: 'zh-CN',
  fontSize: 16,
  autoSave: true
})

@Component
struct LocalStorageObjectDemo {
  @LocalStorageLink('userProfile') profile: {
    name: string
    email: string
    age: number
  } = { name: '', email: '', age: 0 }

  @LocalStorageLink('appConfig') config: {
    language: string
    fontSize: number
    autoSave: boolean
  } = { language: 'en', fontSize: 14, autoSave: false }

  build() {
    Column() {
      Text('Object Storage Demo')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('User Profile')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Name: ' + this.profile.name)
          .fontSize(14)
          .margin(5)

        Text('Email: ' + this.profile.email)
          .fontSize(14)
          .margin(5)

        Text('Age: ' + this.profile.age)
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#E8F5E9')
      .borderRadius(10)
      .margin(10)

      Column() {
        Text('App Config')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Language: ' + this.config.language)
          .fontSize(14)
          .margin(5)

        Text('Font Size: ' + this.config.fontSize)
          .fontSize(14)
          .margin(5)

        Text('Auto Save: ' + (this.config.autoSave ? 'On' : 'Off'))
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(10)
      .margin(10)

      Row() {
        Button('Update Profile')
          .onClick(() => {
            this.profile.name = 'Jane Doe'
            this.profile.email = 'jane@example.com'
          })
          .margin(5)

        Button('Toggle AutoSave')
          .onClick(() => {
            this.config.autoSave = !this.config.autoSave
          })
          .margin(5)
      }
      .margin(15)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestLocalStorageLinkDecorator {
  @State testTitle: string = '@LocalStorageLink Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906600')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@LocalStorageLink without storage')
          .fontSize(14)
          .margin(5)

        Text('@LocalStorageLink with invalid key')
          .fontSize(14)
          .margin(5)

        Text('@LocalStorageLink outside @Component')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@LocalStorageLink Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Requires LocalStorage context')
          .fontSize(14)
          .margin(2)

        Text('2. Key must be non-empty string')
          .fontSize(14)
          .margin(2)

        Text('3. Must be inside @Component')
          .fontSize(14)
          .margin(2)

        Text('4. Two-way binding with LocalStorage')
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

        Text('let storage = new LocalStorage()')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyComponent {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @LocalStorageLink("key")')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  value: string = "default"')
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
