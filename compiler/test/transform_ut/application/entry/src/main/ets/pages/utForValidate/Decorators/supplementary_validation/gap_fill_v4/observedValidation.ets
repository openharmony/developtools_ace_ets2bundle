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

// Test Case: Observed Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function observedErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function observedErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function observedErrorCase3() {
}

// Correct Usage Component 1: Observed item builder
@Builder
function buildObservedItem(name: string, status: string, changeCount: number) {
  Row() {
    Column() {
      Text(name)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(status)
        .fontSize(11)
        .fontColor(changeCount > 0 ? '#4CAF50' : '#999999')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Row() {
      Text('Changes: ')
        .fontSize(12)
        .fontColor('#666666')
      
      Text(changeCount.toString())
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor('#E91E63')
    }
  }
  .width('100%')
  .padding(12)
  .backgroundColor(changeCount > 0 ? '#FCE4EC' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Observed card styles
@Styles
function observedCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Observed badge extension
@Extend(Text)
function observedBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 10, vertical: 4 })
  .backgroundColor('#E91E63')
  .borderRadius(12)
}

@Entry
@Component
struct ObservedValidation {
  @State testTitle: string = 'Observed Decorator Validation'
  @State errorCount: number = 3
  @State observedCount: number = 4
  @State totalChanges: number = 23
  @State isObserving: boolean = true

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Observable State Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Observation Status Card
      Column() {
        Row() {
          Column() {
            Text('Observation')
              .fontSize(14)
              .fontColor('#666666')
            
            Text(this.isObserving ? 'Active' : 'Paused')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor(this.isObserving ? '#4CAF50' : '#9E9E9E')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(50)
            .color('#E0E0E0')
          
          Column() {
            Text('Total Changes')
              .fontSize(14)
              .fontColor('#666666')
            
            Text(this.totalChanges.toString())
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#E91E63')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(50)
            .color('#E0E0E0')
          
          Column() {
            Text('Observed')
              .fontSize(14)
              .fontColor('#666666')
            
            Text(this.observedCount.toString())
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#2196F3')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
        }
        .width('100%')
      }
      .observedCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Column() {
          Text('⚠ Validation Errors')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text(`Error Code: 10905117`)
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

      // Observed Objects List
      Column() {
        Row() {
          Text('Observed Objects')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
          
          if (this.isObserving) {
            Text('LIVE')
              .observedBadgeText()
          }
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        buildObservedItem('userState', 'Observable', 12)
        buildObservedItem('appConfig', 'Observable', 5)
        buildObservedItem('themeSettings', 'Observable', 3)
        buildObservedItem('cacheData', 'Observable', 3)
      }
      .observedCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details Panel
      Column() {
        Text('Decorator Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Column() {
          Row() {
            Text('1. @Builder + @Styles')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 8, vertical: 2 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
          }
          .padding(8)
          .backgroundColor('#FAFAFA')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('2. @Extend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 8, vertical: 2 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
          }
          .padding(8)
          .backgroundColor('#FAFAFA')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('3. @AnimatableExtend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 8, vertical: 2 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
          }
          .padding(8)
          .backgroundColor('#FAFAFA')
          .borderRadius(6)
        }
        .width('100%')
      }
      .observedCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button(this.isObserving ? 'Pause Observation' : 'Resume Observation')
          .width('48%')
          .height(46)
          .backgroundColor(this.isObserving ? '#FF9800' : '#4CAF50')
          .fontSize(14)
          .borderRadius(8)
          .onClick(() => {
            this.isObserving = !this.isObserving
          })
        
        Button('Simulate Change')
          .width('48%')
          .height(46)
          .backgroundColor('#E91E63')
          .fontSize(14)
          .borderRadius(8)
          .onClick(() => {
            this.totalChanges++
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