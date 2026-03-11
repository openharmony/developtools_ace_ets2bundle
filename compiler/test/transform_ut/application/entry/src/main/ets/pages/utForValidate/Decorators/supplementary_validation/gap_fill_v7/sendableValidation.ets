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

// Test Case: Sendable Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function sendableErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function sendableErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function sendableErrorCase3() {
}

// Correct Usage Component 1: Sendable item builder
@Builder
function buildSendableItem(name: string, type: string, serializable: boolean) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text(serializable ? '✓' : '')
          .fontSize(12)
          .fontColor('#4CAF50')
          .margin({ left: 6 })
      }
      .margin({ bottom: 4 })
      
      Text(type)
        .fontSize(11)
        .fontColor('#666666')
        .fontFamily('monospace')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(serializable ? 'Sendable' : 'Not Sendable')
      .fontSize(12)
      .fontColor(serializable ? '#4CAF50' : '#9E9E9E')
      .padding({ horizontal: 8, vertical: 3 })
      .backgroundColor(serializable ? '#E8F5E9' : '#F5F5F5')
      .borderRadius(4)
  }
  .width('100%')
  .padding(12)
  .backgroundColor(serializable ? '#F1F8E9' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Sendable card styles
@Styles
function sendableCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Sendable badge extension
@Extend(Text)
function sendableBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#4CAF50')
  .borderRadius(3)
}

@Entry
@Component
struct SendableValidation {
  @State testTitle: string = 'Sendable Decorator Validation'
  @State errorCount: number = 3
  @State sendableTypes: number = 6
  @State transferredCount: number = 128

  build() {
    Column() {
      // Header
      Column() {
        Row() {
          Text('📤')
            .fontSize(24)
            .margin({ right: 8 })
          
          Text(this.testTitle)
            .fontSize(26)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
        }
        .margin({ bottom: 8 })
        
        Text('Cross-Context Transfer Validation')
          .fontSize(14)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Transfer Counter
      Column() {
        Text('Items Transferred')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(this.transferredCount.toString())
          .fontSize(36)
          .fontWeight(FontWeight.Bold)
          .fontColor('#4CAF50')
          .animation({ duration: 300 })
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#E8F5E9')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Grid
      Row() {
        Column() {
          Text(this.sendableTypes.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Sendable Types')
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
          Text('0')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#9E9E9E')
          
          Text('Blocked')
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
          Text('Sendable Validation Errors')
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

      // Sendable Types
      Column() {
        Text('Sendable Types')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildSendableItem('UserData', 'Object', true)
        buildSendableItem('Config', 'Object', true)
        buildSendableItem('Message', 'Object', true)
        buildSendableItem('Callback', 'Function', false)
      }
      .sendableCardStyle()
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
      .sendableCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Transfer Item')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.transferredCount++
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Sendable validation completed')
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