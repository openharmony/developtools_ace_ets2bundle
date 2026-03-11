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

// Test Case: Styles Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function stylesErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function stylesErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function stylesErrorCase3() {
}

// Correct Usage Component 1: Style definition builder
@Builder
function buildStyleDef(name: string, properties: number, applied: boolean) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text(`${properties} props`)
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#9C27B0')
          .borderRadius(3)
          .margin({ left: 8 })
      }
      .margin({ bottom: 4 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(applied ? '✓' : '')
      .fontSize(18)
      .fontColor('#4CAF50')
  }
  .width('100%')
  .padding(12)
  .backgroundColor(applied ? '#F3E5F5' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Styles card styles
@Styles
function stylesCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Styles badge extension
@Extend(Text)
function stylesBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#9C27B0')
  .borderRadius(3)
}

@Entry
@Component
struct StylesValidation {
  @State testTitle: string = 'Styles Decorator Validation'
  @State errorCount: number = 3
  @State styleCount: number = 8
  @State appliedStyles: number = 5

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Multiple Styles Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Grid
      Row() {
        Column() {
          Text(this.styleCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#9C27B0')
          
          Text('Style Definitions')
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
          Text(this.appliedStyles.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Applied')
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
      .backgroundColor('#F3E5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Styles Validation Errors')
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

      // Style Definitions
      Column() {
        Text('Style Definitions')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildStyleDef('primaryStyle', 5, true)
        buildStyleDef('secondaryStyle', 3, true)
        buildStyleDef('cardStyle', 4, true)
        buildStyleDef('headerStyle', 2, false)
      }
      .stylesCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
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
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
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
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
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
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
        }
        .width('100%')
      }
      .stylesCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Apply Style')
          .width('48%')
          .height(46)
          .backgroundColor('#9C27B0')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            if (this.appliedStyles < this.styleCount) {
              this.appliedStyles++
            }
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Styles validation completed')
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