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
 * Test case: Monitor decorator error
 * Purpose: Verify @Monitor decorator parameter requirements
 * Error code: 10905364
 */

// ============================================
// Test Case 1: @Monitor with invalid path
// Expected Error: 10905364
// ============================================

@ComponentV2
struct MonitorInvalidPath {
  @Local count: number = 0
  @Local user: { name: string, age: number } = { name: 'Test', age: 20 }

  // Error: Invalid monitor path
  @Monitor('invalid.path')
  onCountChange() {
    console.log('Count changed')
  }

  build() {
    Column() {
      Text('Count: ' + this.count)
        .onClick(() => {
          this.count++
        })
    }
  }
}

// ============================================
// Test Case 2: @Monitor with non-existent property
// Expected Error: 10905364
// ============================================

@ComponentV2
struct MonitorNonExistentProp {
  @Local value: number = 10

  // Error: Monitoring non-existent property
  @Monitor('nonExistent')
  onValueChange() {
    console.log('Value changed')
  }

  build() {
    Column() {
      Text('Value: ' + this.value)
    }
  }
}

// ============================================
// Test Case 3: Correct @Monitor usage
// ============================================

@ComponentV2
struct CorrectMonitorUsage {
  @Local counter: number = 0
  @Local message: string = 'Hello'
  @Local user: { name: string, age: number } = { name: 'John', age: 25 }
  @Local items: string[] = ['item1', 'item2']

  // Correct: Monitor simple property
  @Monitor('counter')
  onCounterChange() {
    console.log('Counter changed to: ' + this.counter)
  }

  // Correct: Monitor another property
  @Monitor('message')
  onMessageChange() {
    console.log('Message changed to: ' + this.message)
  }

  // Correct: Monitor nested property
  @Monitor('user.name')
  onUserNameChange() {
    console.log('User name changed to: ' + this.user.name)
  }

  // Correct: Monitor array length
  @Monitor('items.length')
  onItemsLengthChange() {
    console.log('Items length changed to: ' + this.items.length)
  }

  build() {
    Column() {
      Text('Monitor Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Counter: ' + this.counter)
          .fontSize(18)
          .margin(10)

        Button('Increment')
          .onClick(() => {
            this.counter++
          })
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#E3F2FD')
      .margin(10)

      Column() {
        Text('Message: ' + this.message)
          .fontSize(18)
          .margin(10)

        Button('Change Message')
          .onClick(() => {
            this.message = this.message === 'Hello' ? 'World' : 'Hello'
          })
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F3E5F5')
      .margin(10)

      Column() {
        Text('User: ' + this.user.name + ', ' + this.user.age)
          .fontSize(18)
          .margin(10)

        Button('Change Name')
          .onClick(() => {
            this.user.name = this.user.name === 'John' ? 'Jane' : 'John'
          })
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)

      Column() {
        Text('Items count: ' + this.items.length)
          .fontSize(18)
          .margin(10)

        Button('Add Item')
          .onClick(() => {
            this.items.push('item' + (this.items.length + 1))
          })
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}

// ============================================
// Test Case 4: Multiple @Monitor on same struct
// ============================================

@ComponentV2
struct MultipleMonitors {
  @Local temperature: number = 25
  @Local humidity: number = 60
  @Local pressure: number = 1013

  @Monitor('temperature')
  onTemperatureChange() {
    console.info('Temperature: ' + this.temperature)
  }

  @Monitor('humidity')
  onHumidityChange() {
    console.info('Humidity: ' + this.humidity)
  }

  @Monitor('pressure')
  onPressureChange() {
    console.info('Pressure: ' + this.pressure)
  }

  build() {
    Column() {
      Text('Weather Monitor')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Text('Temperature: ' + this.temperature + '°C')
        .fontSize(16)
        .margin(5)

      Text('Humidity: ' + this.humidity + '%')
        .fontSize(16)
        .margin(5)

      Text('Pressure: ' + this.pressure + ' hPa')
        .fontSize(16)
        .margin(5)

      Row() {
        Button('+Temp')
          .onClick(() => this.temperature++)
          .margin(5)

        Button('+Humidity')
          .onClick(() => this.humidity++)
          .margin(5)

        Button('+Pressure')
          .onClick(() => this.pressure++)
          .margin(5)
      }
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
struct TestMonitorDecorator {
  @State testTitle: string = '@Monitor Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905364')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Monitor with invalid property path')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Monitor Rules:',)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must specify valid property path')
          .fontSize(14)
          .margin(2)

        Text('2. Supports nested properties (obj.prop)')
          .fontSize(14)
          .margin(2)

        Text('3. Supports array length (arr.length)')
          .fontSize(14)
          .margin(2)

        Text('4. Cannot monitor non-existent properties')
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

        Text('@Monitor("propertyName")')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('onPropertyChange() { ... }')
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
