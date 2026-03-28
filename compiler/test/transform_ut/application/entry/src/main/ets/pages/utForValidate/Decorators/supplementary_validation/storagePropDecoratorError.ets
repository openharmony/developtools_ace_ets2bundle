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
 * Test case: StorageProp decorator error
 * Purpose: Verify @StorageProp decorator usage and validation
 * Error code: 10906500
 */

// ============================================
// Test Case 1: @StorageProp with invalid key
// Expected Error: 10906500
// ============================================

@Component
struct StoragePropInvalidKey {
  @StorageProp('') emptyKey: string = 'default'

  build() {
    Column() {
      Text(this.emptyKey)
    }
  }
}

// ============================================
// Test Case 2: @StorageProp without @Component
// Expected Error: 10906500
// ============================================

class StoragePropOutside {
  @StorageProp('data') data: number = 0
}

// ============================================
// Test Case 3: @StorageProp with wrong type
// Expected Error: 10906500
// ============================================

@Component
struct StoragePropWrongType {
  @StorageProp('flag') flag: string = 'true'

  build() {
    Column() {
      Text('Flag: ' + this.flag)
    }
  }
}

// ============================================
// Test Case 4: Correct @StorageProp usage
// ============================================

AppStorage.setOrCreate('userName', 'Anonymous')
AppStorage.setOrCreate('isPremium', false)
AppStorage.setOrCreate('visitCount', 0)
AppStorage.setOrCreate('preferredLang', 'en')

@Component
struct CorrectStoragePropUsage {
  @StorageProp('userName') userName: string = 'Anonymous'
  @StorageProp('isPremium') isPremium: boolean = false
  @StorageProp('visitCount') visitCount: number = 0
  @StorageProp('preferredLang') preferredLang: string = 'en'

  build() {
    Column() {
      Text('Storage Property Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Row() {
          Text('User:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .layoutWeight(1)

          Text(this.userName)
            .fontSize(16)
            .fontColor('#1890FF')
        }
        .width('100%')
        .margin(8)

        Row() {
          Text('Premium Status:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .layoutWeight(1)

          Text(this.isPremium ? '✓ Yes' : '✗ No')
            .fontSize(16)
            .fontColor(this.isPremium ? Color.Green : Color.Gray)
        }
        .width('100%')
        .margin(8)

        Row() {
          Text('Visits:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .layoutWeight(1)

          Text('' + this.visitCount)
            .fontSize(16)
            .fontColor('#FF6B6B')
        }
        .width('100%')
        .margin(8)

        Row() {
          Text('Language:')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .layoutWeight(1)

          Text(this.preferredLang.toUpperCase())
            .fontSize(16)
            .fontColor('#52C41A')
        }
        .width('100%')
        .margin(8)
      }
      .padding(20)
      .backgroundColor('#F5F5F5')
      .borderRadius(10)
      .margin(15)

      Text('Note: @StorageProp is read-only')
        .fontSize(12)
        .fontColor('#999999')
        .fontStyle(FontStyle.Italic)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: @StorageProp vs @StorageLink comparison
// ============================================

AppStorage.setOrCreate('sharedCounter', 0)

@Component
struct StorageComparisonDemo {
  @StorageProp('sharedCounter') readOnlyCounter: number = 0
  @StorageLink('sharedCounter') writableCounter: number = 0
  @State localCounter: number = 0

  build() {
    Column() {
      Text('Storage Comparison')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('@StorageProp (Read-Only)')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Value: ' + this.readOnlyCounter)
          .fontSize(20)
          .fontColor('#1890FF')
          .margin(5)

        Button('Try Update (Read-Only)')
          .onClick(() => {
            this.localCounter++
          })
          .width(180)
          .height(40)
          .margin(5)
          .enabled(false)
      }
      .padding(15)
      .backgroundColor('#E3F2FD')
      .borderRadius(8)
      .margin(10)

      Column() {
        Text('@StorageLink (Two-Way)')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Value: ' + this.writableCounter)
          .fontSize(20)
          .fontColor('#52C41A')
          .margin(5)

        Button('Increment (Writable)')
          .onClick(() => {
            this.writableCounter++
          })
          .width(180)
          .height(40)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#E8F5E9')
      .borderRadius(8)
      .margin(10)

      Text('Local Counter: ' + this.localCounter)
        .fontSize(14)
        .fontColor('#999999')
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 6: @StorageProp for display only
// ============================================

AppStorage.setOrCreate('systemInfo', {
  version: '1.0.0',
  platform: 'HarmonyOS',
  buildDate: '2026-01-01'
})

AppStorage.setOrCreate('featureFlags', {
  newUI: true,
  betaFeature: false,
  darkModeDefault: false
})

@Component
struct StoragePropDisplayOnly {
  @StorageProp('systemInfo') sysInfo: {
    version: string
    platform: string
    buildDate: string
  } = {
    version: '1.0.0',
    platform: 'HarmonyOS',
    buildDate: '2026-01-01'
  }

  @StorageProp('featureFlags') features: {
    newUI: boolean
    betaFeature: boolean
    darkModeDefault: boolean
  } = {
    newUI: true,
    betaFeature: false,
    darkModeDefault: false
  }

  build() {
    Column() {
      Text('System Information')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Version Info')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('App Version: ' + this.sysInfo.version)
          .fontSize(14)
          .margin(5)

        Text('Platform: ' + this.sysInfo.platform)
          .fontSize(14)
          .margin(5)

        Text('Build Date: ' + this.sysInfo.buildDate)
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F3E5F5')
      .borderRadius(10)
      .margin(10)

      Column() {
        Text('Feature Flags')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Row() {
          Text('New UI:')
            .fontSize(14)
            .layoutWeight(1)

          Text(this.features.newUI ? 'Enabled' : 'Disabled')
            .fontSize(14)
            .fontColor(this.features.newUI ? Color.Green : Color.Gray)
        }
        .width('100%')
        .margin(5)

        Row() {
          Text('Beta Features:')
            .fontSize(14)
            .layoutWeight(1)

          Text(this.features.betaFeature ? 'Enabled' : 'Disabled')
            .fontSize(14)
            .fontColor(this.features.betaFeature ? Color.Orange : Color.Gray)
        }
        .width('100%')
        .margin(5)

        Row() {
          Text('Dark Mode Default:')
            .fontSize(14)
            .layoutWeight(1)

          Text(this.features.darkModeDefault ? 'Yes' : 'No')
            .fontSize(14)
            .fontColor(this.features.darkModeDefault ? Color.Blue : Color.Gray)
        }
        .width('100%')
        .margin(5)
      }
      .padding(15)
      .backgroundColor('#FFF3E0')
      .borderRadius(10)
      .margin(10)
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
struct TestStoragePropDecorator {
  @State testTitle: string = '@StorageProp Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906500')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@StorageProp with invalid key')
          .fontSize(14)
          .margin(5)

        Text('@StorageProp outside @Component')
          .fontSize(14)
          .margin(5)

        Text('@StorageProp with wrong type')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@StorageProp Rules:')
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

        Text('4. Read-only binding with AppStorage')
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

        Text('  @StorageProp("key")')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  readonly value: string = "default"')
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
