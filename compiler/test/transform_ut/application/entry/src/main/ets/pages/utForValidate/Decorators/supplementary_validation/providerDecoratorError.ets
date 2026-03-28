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
 * Test case: Provider decorator error
 * Purpose: Verify @Provider decorator usage and validation
 * Error code: 10905200
 */

// ============================================
// Test Case 1: @Provider without @Component
// Expected Error: 10905200
// ============================================

class ProviderWithoutComponent {
  @Provider() theme: string = 'dark'
}

// ============================================
// Test Case 2: @Provider with invalid type
// Expected Error: 10905200
// ============================================

@Component
struct ProviderWithInvalidType {
  @Provider() data: Map<string, any> = new Map()

  build() {
    Column() {
      Text('Provider with Map')
    }
  }
}

// ============================================
// Test Case 3: @Provider with function
// Expected Error: 10905200
// ============================================

@Component
struct ProviderWithFunction {
  @Provider() callback: () => void = () => {}

  build() {
    Column() {
      Text('Provider with function')
    }
  }
}

// ============================================
// Test Case 4: Correct @Provider usage
// ============================================

@Component
struct CorrectProviderUsage {
  @Provider() themeColor: string = '#1890FF'
  @Provider() fontSize: number = 16
  @Provider() isDarkMode: boolean = false
  @Provider() languages: string[] = ['en', 'zh', 'ja']

  build() {
    Column() {
      Text('Theme Settings')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Theme Color: ' + this.themeColor)
          .fontSize(18)
          .fontColor(this.themeColor)
          .margin(10)

        Text('Font Size: ' + this.fontSize)
          .fontSize(16)
          .margin(5)

        Text('Dark Mode: ' + (this.isDarkMode ? 'Enabled' : 'Disabled'))
          .fontSize(16)
          .margin(5)

        Text('Languages: ' + this.languages.join(', '))
          .fontSize(16)
          .margin(5)
      }
      .padding(20)
      .backgroundColor('#F5F5F5')
      .borderRadius(10)
      .margin(15)

      Row() {
        Button('Toggle Dark Mode')
          .onClick(() => {
            this.isDarkMode = !this.isDarkMode
          })
          .margin(5)

        Button('Change Color')
          .onClick(() => {
            this.themeColor = this.themeColor === '#1890FF' ? '#52C41A' : '#1890FF'
          })
          .margin(5)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// ============================================
// Test Case 5: @Provider with object types
// ============================================

interface AppConfig {
  apiEndpoint: string
  timeout: number
  retryCount: number
}

@Component
struct ProviderWithObject {
  @Provider() config: AppConfig = {
    apiEndpoint: 'https://api.example.com',
    timeout: 5000,
    retryCount: 3
  }

  @Provider() userPreferences: Record<string, string | number | boolean> = {
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    autoSave: true,
    autoSaveInterval: 300
  }

  build() {
    Column() {
      Text('Application Configuration')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('API Config',)
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Endpoint: ' + this.config.apiEndpoint)
          .fontSize(14)
          .margin(3)

        Text('Timeout: ' + this.config.timeout + 'ms')
          .fontSize(14)
          .margin(3)

        Text('Retry: ' + this.config.retryCount)
          .fontSize(14)
          .margin(3)
      }
      .padding(15)
      .backgroundColor('#E3F2FD')
      .borderRadius(8)
      .margin(10)

      Column() {
        Text('User Preferences')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin(10)

        Text('Language: ' + this.userPreferences.language)
          .fontSize(14)
          .margin(3)

        Text('Timezone: ' + this.userPreferences.timezone)
          .fontSize(14)
          .margin(3)

        Text('Auto Save: ' + (this.userPreferences.autoSave ? 'On' : 'Off'))
          .fontSize(14)
          .margin(3)
      }
      .padding(15)
      .backgroundColor('#F3E5F5')
      .borderRadius(8)
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
struct TestProviderDecorator {
  @State testTitle: string = '@Provider Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905200')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Provider outside @Component')
          .fontSize(14)
          .margin(5)

        Text('@Provider with invalid types')
          .fontSize(14)
          .margin(5)

        Text('@Provider with function type')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Provider Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must be used inside @Component')
          .fontSize(14)
          .margin(2)

        Text('2. Provides data to child components')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot use function types')
          .fontSize(14)
          .margin(2)

        Text('4. Works with @Consume in children')
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

        Text('struct Parent {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Provider() theme: string = "dark"')
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
