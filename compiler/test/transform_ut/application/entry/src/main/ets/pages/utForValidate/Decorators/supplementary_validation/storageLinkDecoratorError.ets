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
 * Test case: StorageLink decorator error
 * Purpose: Verify @StorageLink decorator usage and validation
 * Error code: 10906400
 */

// ============================================
// Test Case 1: @StorageLink with invalid key
// Expected Error: 10906400
// ============================================

@Component
struct StorageLinkInvalidKey {
  @StorageLink('') invalidKey: string = 'default'

  build() {
    Column() {
      Text(this.invalidKey)
    }
  }
}

// ============================================
// Test Case 2: @StorageLink without @Component
// Expected Error: 10906400
// ============================================

class StorageLinkOutside {
  @StorageLink('key') value: string = ''
}

// ============================================
// Test Case 3: @StorageLink with wrong type
// Expected Error: 10906400
// ============================================

@Component
struct StorageLinkWrongType {
  @StorageLink('count') count: string = '0'

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

// ============================================
// Test Case 4: Correct @StorageLink usage
// ============================================

AppStorage.setOrCreate('username', 'Guest')
AppStorage.setOrCreate('isLoggedIn', false)
AppStorage.setOrCreate('theme', 'light')
AppStorage.setOrCreate('fontSize', 16)

@Component
struct CorrectStorageLinkUsage {
  @StorageLink('username') username: string = 'Guest'
  @StorageLink('isLoggedIn') isLoggedIn: boolean = false
  @StorageLink('theme') theme: string = 'light'
  @StorageLink('fontSize') fontSize: number = 16

  build() {
    Column() {
      Text('Storage Link Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('User Profile')
          .fontSize(20)
          .fontWeight(FontWeight.Medium)
          .margin(15)

        Text('Username: ' + this.username)
          .fontSize(16)
          .margin(5)

        Text('Status: ' + (this.isLoggedIn ? 'Logged In' : 'Guest'))
          .fontSize(16)
          .fontColor(this.isLoggedIn ? Color.Green : Color.Gray)
          .margin(5)

        Text('Theme: ' + this.theme)
          .fontSize(16)
          .margin(5)

        Text('Font Size: ' + this.fontSize)
          .fontSize(16)
          .margin(5)
      }
      .padding(20)
      .backgroundColor(this.theme === 'dark' ? '#333333' : '#F5F5F5')
      .borderRadius(10)
      .margin(15)

      Row() {
        Button(this.isLoggedIn ? 'Logout' : 'Login')
          .onClick(() => {
            this.isLoggedIn = !this.isLoggedIn
            this.username = this.isLoggedIn ? 'User123' : 'Guest'
          })
          .width(120)
          .height(45)
          .margin(5)

        Button('Toggle Theme')
          .onClick(() => {
            this.theme = this.theme === 'light' ? 'dark' : 'light'
          })
          .width(120)
          .height(45)
          .margin(5)
      }
      .margin(15)

      Row() {
        Button('Font -')
          .onClick(() => {
            this.fontSize = Math.max(12, this.fontSize - 2)
          })
          .width(80)
          .height(40)
          .margin(5)

        Button('Font +')
          .onClick(() => {
            this.fontSize = Math.min(24, this.fontSize + 2)
          })
          .width(80)
          .height(40)
          .margin(5)
      }
      .margin(15)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: @StorageLink persistence demo
// ============================================

AppStorage.setOrCreate('appSettings', {
  notifications: true,
  soundEnabled: true,
  autoSync: false,
  language: 'zh-CN'
})

AppStorage.setOrCreate('userStats', {
  totalLogins: 0,
  lastVisit: new Date().toISOString(),
  preferenceScore: 0
})

@Component
struct StoragePersistenceDemo {
  @StorageLink('appSettings') settings: {
    notifications: boolean
    soundEnabled: boolean
    autoSync: boolean
    language: string
  } = {
    notifications: true,
    soundEnabled: true,
    autoSync: false,
    language: 'zh-CN'
  }

  @StorageLink('userStats') stats: {
    totalLogins: number
    lastVisit: string
    preferenceScore: number
  } = {
    totalLogins: 0,
    lastVisit: new Date().toISOString(),
    preferenceScore: 0
  }

  build() {
    Column() {
      Text('Storage Persistence Demo')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Application Settings')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Row() {
          Text('Notifications:')
            .fontSize(14)
            .layoutWeight(1)

          Toggle({ type: ToggleType.Switch, isOn: this.settings.notifications })
            .onChange((isOn: boolean) => {
              this.settings.notifications = isOn
            })
        }
        .width('100%')
        .margin(5)

        Row() {
          Text('Sound:')
            .fontSize(14)
            .layoutWeight(1)

          Toggle({ type: ToggleType.Switch, isOn: this.settings.soundEnabled })
            .onChange((isOn: boolean) => {
              this.settings.soundEnabled = isOn
            })
        }
        .width('100%')
        .margin(5)

        Row() {
          Text('Auto Sync:')
            .fontSize(14)
            .layoutWeight(1)

          Toggle({ type: ToggleType.Switch, isOn: this.settings.autoSync })
            .onChange((isOn: boolean) => {
              this.settings.autoSync = isOn
            })
        }
        .width('100%')
        .margin(5)
      }
      .padding(15)
      .backgroundColor('#E8F5E9')
      .borderRadius(10)
      .margin(10)

      Column() {
        Text('User Statistics')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Total Logins: ' + this.stats.totalLogins)
          .fontSize(14)
          .margin(5)

        Text('Last Visit: ' + this.stats.lastVisit.substring(0, 10))
          .fontSize(14)
          .margin(5)

        Text('Preference Score: ' + this.stats.preferenceScore)
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#E3F2FD')
      .borderRadius(10)
      .margin(10)

      Button('Update Stats')
        .onClick(() => {
          this.stats.totalLogins++
          this.stats.lastVisit = new Date().toISOString()
          this.stats.preferenceScore += 10
        })
        .width(180)
        .height(45)
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
struct TestStorageLinkDecorator {
  @State testTitle: string = '@StorageLink Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906400')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@StorageLink with invalid key')
          .fontSize(14)
          .margin(5)

        Text('@StorageLink outside @Component')
          .fontSize(14)
          .margin(5)

        Text('@StorageLink with wrong type')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@StorageLink Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Key must be non-empty string')
          .fontSize(14)
          .margin(2)

        Text('2. Must be inside @Component')
          .fontSize(14)
          .margin(2)

        Text('3. Type must match stored value')
          .fontSize(14)
          .margin(2)

        Text('4. Two-way binding with AppStorage')
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

        Text('struct MyComponent {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @StorageLink("key")')
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
