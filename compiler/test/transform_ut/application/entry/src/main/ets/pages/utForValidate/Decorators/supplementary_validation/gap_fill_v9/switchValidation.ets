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

// Test Case: Switch Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function switchErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function switchErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function switchErrorCase3() {
}

// Correct Usage Component 1: Switch case builder
@Builder
function buildSwitchCase(value: string, matched: boolean, isDefault: boolean) {
  Column() {
    Row() {
      Text(isDefault ? 'default' : `case '${value}':`)
        .fontSize(13)
        .fontColor(isDefault ? '#FF9800' : (matched ? '#4CAF50' : '#333333'))
        .fontWeight(matched ? FontWeight.Bold : FontWeight.Normal)
        .fontFamily('monospace')
        .layoutWeight(1)
      
      if (matched) {
        Text('●')
          .fontSize(10)
          .fontColor('#4CAF50')
      }
    }
    .width('100%')
    
    // Case content
    Column() {
      Text('{ ... }')
        .fontSize(11)
        .fontColor('#999999')
        .fontFamily('monospace')
    }
    .width('100%')
    .padding(6)
    .backgroundColor('#FAFAFA')
    .borderRadius(3)
    .margin({ top: 4 })
  }
  .width('100%')
  .padding(10)
  .backgroundColor(matched ? '#E8F5E9' : (isDefault ? '#FFF8E1' : '#F5F5F5'))
  .borderRadius(6)
  .margin({ bottom: 6 })
  .border({ width: matched ? 2 : 0, color: '#4CAF50' })
}

// Correct Usage Component 2: Switch card styles
@Styles
function switchCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Switch value extension
@Extend(Text)
function switchValueText() {
  .fontSize(24)
  .fontWeight(FontWeight.Bold)
  .fontColor('#FF9800')
  .fontFamily('monospace')
}

@Entry
@Component
struct SwitchValidation {
  @State testTitle: string = 'Switch Decorator Validation'
  @State errorCount: number = 3
  @State currentValue: string = 'B'
  @State caseCount: number = 4

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Switch Statement Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Current Value Display
      Column() {
        Text('Switch Value')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(`'${this.currentValue}'`)
          .switchValueText()
      }
  <parameter name="content">.width('100%')
      .padding(20)
      .backgroundColor('#FFF8E1')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Case Selector
      Column() {
        Text('Select Case')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 10 })
        
        Row() {
          ForEach(['A', 'B', 'C', 'D'], (value: string) => {
            Text(value)
              .fontSize(16)
              .fontWeight(this.currentValue === value ? FontWeight.Bold : FontWeight.Normal)
              .fontColor(this.currentValue === value ? '#FFFFFF' : '#666666')
              .width(48)
              .height(48)
              .backgroundColor(this.currentValue === value ? '#FF9800' : '#F5F5F5')
              .borderRadius(24)
              .textAlign(TextAlign.Center)
              .margin({ right: 8 })
              .onClick(() => {
                this.currentValue = value
              })
          })
        }
        .width('100%')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FAFAFA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.caseCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
          
          Text('Cases')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text('1')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Matched')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text(this.errorCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
          
          Text('Errors')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FAFAFA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Switch Validation Errors')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text(`Error Code: 10905117`)
            .fontSize(13)
            .fontColor('#FF9800')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FFF5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Switch Cases
      Column() {
        Text('Switch Cases')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildSwitchCase('A', this.currentValue === 'A', false)
        buildSwitchCase('B', this.currentValue === 'B', false)
        buildSwitchCase('C', this.currentValue === 'C', false)
        buildSwitchCase('', false, true)
      }
      .switchCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Column() {
          Row() {
            Text('@Builder + @Styles')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@Extend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@AnimatableExtend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
        }
        .width('100%')
      }
      .switchCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Reset')
          .width('48%')
          .height(46)
          .backgroundColor('#9E9E9E')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.currentValue = 'A'
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#FF9800')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Switch validation completed')
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}