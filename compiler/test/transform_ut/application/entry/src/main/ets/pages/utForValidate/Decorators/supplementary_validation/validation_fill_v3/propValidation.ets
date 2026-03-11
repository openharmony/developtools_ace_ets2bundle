/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

// Test Case: Prop Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function propErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function propErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function propErrorCase3() {
}

// Correct Usage Component 1: Property demo builder
@Builder
function buildPropDemo(propName: string, propType: string, value: string) {
  Row() {
    Column() {
      Text(propName)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(propType)
        .fontSize(11)
        .fontColor('#999999')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Divider()
      .vertical(true)
      .height(30)
      .strokeWidth(1)
      .color('#E0E0E0')
      .margin({ horizontal: 12 })
    
    Text(value)
      .fontSize(14)
      .fontColor('#2196F3')
      .fontWeight(FontWeight.Medium)
  }
  .width('100%')
  .padding(14)
  .backgroundColor('#F9F9F9')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Property card styles
@Styles
function propCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Property label extension
@Extend(Text)
function propLabelText() {
  .fontSize(13)
  .fontColor('#666666')
  .width(80)
}

@Entry
@Component
struct PropValidation {
  @State testTitle: string = 'Prop Decorator Validation'
  @State errorCount: number = 3
  @State propValue: string = 'initial'
  @State counter: number = 0

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Property Binding Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Error Alert
      Row() {
        Column() {
          Text('⚠ Validation Errors Detected')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text('Error Code: 10905117')
            .fontSize(13)
            .fontColor('#FF9800')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        
        Text(this.errorCount.toString())
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF6B6B')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FFF5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Property Inspector
      Column() {
        Text('Property Inspector')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildPropDemo('testTitle', 'string', this.testTitle)
        buildPropDemo('errorCount', 'number', this.errorCount.toString())
        buildPropDemo('propValue', 'string', this.propValue)
        buildPropDemo('counter', 'number', this.counter.toString())
      }
      .propCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Interactive Property Demo
      Column() {
        Text('Interactive Property Demo')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        // Counter display
        Column() {
          Text('Counter Value')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 8 })
          
          Text(this.counter.toString())
            .fontSize(48)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
        }
        .width('100%')
        .padding(20)
        .backgroundColor('#E3F2FD')
        .borderRadius(12)
        .margin({ bottom: 16 })
        .alignItems(HorizontalAlign.Center)

        // Property value input simulation
        Row() {
          Text('Current Value:')
            .propLabelText()
          
          Text(this.propValue)
            .fontSize(16)
            .fontColor('#333333')
            .layoutWeight(1)
        }
        .width('100%')
        .margin({ bottom: 12 })

        // Control buttons
        Row() {
          Button('Decrement')
            .width('30%')
            .height(40)
            .backgroundColor('#FF6B6B')
            .fontSize(13)
            .onClick(() => {
              this.counter--
              this.propValue = `decremented: ${this.counter}`
            })
          
          Button('Reset')
            .width('30%')
            .height(40)
            .margin({ left: 8, right: 8 })
            .backgroundColor('#9E9E9E')
            .fontSize(13)
            .onClick(() => {
              this.counter = 0
              this.propValue = 'reset'
            })
          
          Button('Increment')
            .width('30%')
            .height(40)
            .backgroundColor('#4CAF50')
            .fontSize(13)
            .onClick(() => {
              this.counter++
              this.propValue = `incremented: ${this.counter}`
            })
        }
        .width('100%')
      }
      .propCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Error Details')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Row() {
          Text('1. @Builder + @Styles conflict')
            .fontSize(12)
            .fontColor('#FF6B6B')
            .layoutWeight(1)
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('2. @Extend + @Builder conflict')
            .fontSize(12)
            .fontColor('#FF6B6B')
            .layoutWeight(1)
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('3. @AnimatableExtend + @Builder conflict')
            .fontSize(12)
            .fontColor('#FF6B6B')
            .layoutWeight(1)
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FAFAFA')
      .margin({ left: 20, right: 20, top: 16 })

      // Validate Button
      Row() {
        Button('Run Prop Validation')
          .width('100%')
          .height(48)
          .backgroundColor('#2196F3')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            console.info('Property validation executed')
            this.propValue = 'validated'
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}