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

// Test Case: Link Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function linkErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function linkErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function linkErrorCase3() {
}

// Correct Usage Component 1: Link status builder
@Builder
function buildLinkStatus(status: string, isActive: boolean) {
  Row() {
    Circle({ width: 10, height: 10 })
      .fill(isActive ? '#4CAF50' : '#FF6B6B')
      .margin({ right: 10 })
    
    Text(status)
      .fontSize(15)
      .fontWeight(FontWeight.Medium)
      .fontColor(isActive ? '#4CAF50' : '#FF6B6B')
      .layoutWeight(1)
    
    Text(isActive ? 'Connected' : 'Disconnected')
      .fontSize(13)
      .fontColor('#666666')
  }
  .width('100%')
  .padding(12)
  .backgroundColor(isActive ? '#E8F5E9' : '#FFF5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Link card styles
@Styles
function linkCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Link text extension
@Extend(Text)
function linkStatusText() {
  .fontSize(14)
  .fontColor('#333333')
  .fontWeight(FontWeight.Medium)
}

@Entry
@Component
struct LinkValidation {
  @State testTitle: string = 'Link Decorator Validation'
  @State errorCount: number = 3
  @State linkStatus: boolean = true
  @State linkStrength: number = 85

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Link Connection Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Status Overview
      Column() {
        Text('Connection Status')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildLinkStatus('Primary Link', this.linkStatus)
        buildLinkStatus('Secondary Link', !this.linkStatus)
      }
      .linkCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Link Strength Indicator
      Column() {
        Row() {
          Text('Link Strength')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
          
          Text(`${this.linkStrength}%`)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(this.linkStrength > 70 ? '#4CAF50' : (this.linkStrength > 40 ? '#FF9800' : '#FF6B6B'))
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        // Strength bar
        Row() {
          Row()
            .width(`${this.linkStrength}%`)
            .height(8)
            .backgroundColor(this.linkStrength > 70 ? '#4CAF50' : (this.linkStrength > 40 ? '#FF9800' : '#FF6B6B'))
            .borderRadius(4)
            .animation({ duration: 300, curve: Curve.EaseOut })
        }
        .width('100%')
        .height(8)
        .backgroundColor('#E0E0E0')
        .borderRadius(4)
        .margin({ bottom: 16 })

        // Error Code Display
        Row() {
          Text('Validation Error Code:')
            .fontSize(13)
            .fontColor('#666666')
          
          Text('10905117')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
            .margin({ left: 8 })
        }
        .padding(10)
        .backgroundColor('#FFF5F5')
        .borderRadius(6)
        .width('100%')
      }
      .linkCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Summary
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        List() {
          ListItem() {
            Row() {
              Text('1')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@Builder + @Styles')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
              
              Text('Conflict')
                .fontSize(11)
                .fontColor('#FF6B6B')
                .padding({ horizontal: 8, vertical: 2 })
                .backgroundColor('#FFF5F5')
                .borderRadius(4)
            }
            .padding(10)
          }
          
          ListItem() {
            Row() {
              Text('2')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@Extend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
              
              Text('Conflict')
                .fontSize(11)
                .fontColor('#FF6B6B')
                .padding({ horizontal: 8, vertical: 2 })
                .backgroundColor('#FFF5F5')
                .borderRadius(4)
            }
            .padding(10)
          }
          
          ListItem() {
            Row() {
              Text('3')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@AnimatableExtend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
              
              Text('Conflict')
                .fontSize(11)
                .fontColor('#FF6B6B')
                .padding({ horizontal: 8, vertical: 2 })
                .backgroundColor('#FFF5F5')
                .borderRadius(4)
            }
            .padding(10)
          }
        }
        .width('100%')
        .divider({ strokeWidth: 1, color: '#F0F0F0' })
      }
      .linkCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Control Panel
      Row() {
        Button(this.linkStatus ? 'Disconnect' : 'Connect')
          .width('48%')
          .height(46)
          .backgroundColor(this.linkStatus ? '#FF6B6B' : '#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.linkStatus = !this.linkStatus
          })
        
        Button('Test Link')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.linkStrength = Math.floor(Math.random() * 100)
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