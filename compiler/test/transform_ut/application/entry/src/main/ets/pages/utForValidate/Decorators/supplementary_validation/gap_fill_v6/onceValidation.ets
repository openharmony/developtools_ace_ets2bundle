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

// Test Case: Once Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function onceErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function onceErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function onceErrorCase3() {
}

// Correct Usage Component 1: Once action builder
@Builder
function buildOnceAction(name: string, executed: boolean, timestamp: string) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        if (executed) {
          Text('✓')
            .fontSize(12)
            .fontColor('#4CAF50')
            .margin({ left: 6 })
        }
      }
      .margin({ bottom: 4 })
      
      if (executed) {
        Text(timestamp)
          .fontSize(11)
          .fontColor('#999999')
      }
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(executed ? 'Executed' : 'Pending')
      .fontSize(12)
      .fontColor(executed ? '#4CAF50' : '#FF9800')
      .padding({ horizontal: 8, vertical: 3 })
      .backgroundColor(executed ? '#E8F5E9' : '#FFF8E1')
      .borderRadius(4)
  }
  .width('100%')
  .padding(12)
  .backgroundColor(executed ? '#F1F8E9' : '#FFF8E1')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Once card styles
@Styles
function onceCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Once badge extension
@Extend(Text)
function onceBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#FF9800')
  .borderRadius(3)
}

@Entry
@Component
struct OnceValidation {
  @State testTitle: string = 'Once Decorator Validation'
  @State errorCount: number = 3
  @State onceActions: number = 4
  @State executedCount: number = 2

  build() {
    Column() {
      // Header
      Column() {
        Row() {
          Text('1️⃣')
            .fontSize(24)
            .margin({ right: 8 })
          
          Text(this.testTitle)
            .fontSize(26)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
        }
        .margin({ bottom: 8 })
        
        Text('One-Time Execution Validation')
          .fontSize(14)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Once Stats
      Row() {
        Column() {
          Text(this.onceActions.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
          
          Text('Once Actions')
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
          Text(this.executedCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Executed')
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
      .backgroundColor('#FFF8E1')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Once Validation Errors')
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

      // Once Actions
      Column() {
        Text('One-Time Actions')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildOnceAction('Initialize App', true, '2024-01-15 10:30:00')
        buildOnceAction('Load Config', true, '2024-01-15 10:30:05')
        buildOnceAction('Setup Database', false, '')
        buildOnceAction('Register Service', false, '')
      }
      .onceCardStyle()
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
      .onceCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Execute Next')
          .width('48%')
          .height(46)
          .backgroundColor('#FF9800')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            if (this.executedCount < this.onceActions) {
              this.executedCount++
            }
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Once validation completed')
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